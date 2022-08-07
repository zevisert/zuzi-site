import {
  ChangeEventHandler,
  Dispatch,
  SetStateAction,
  UIEventHandler,
  useCallback,
  useEffect,
  useRef,
  useState,
} from 'react';
import { useDebouncedCallback } from 'use-debounce';

import { Artwork } from '@/lib/types';

import ProgressLinearInfinite from '../progress/linear-infinite';

export default function Positioner({
  item,
  position,
  onChangePosition,
  showing,
  onChangeShowing,
}: {
  item: Artwork;
  position: number;
  onChangePosition: Dispatch<SetStateAction<number>>;
  showing: File | URL | null;
  onChangeShowing: Dispatch<SetStateAction<File | URL | null>>;
}) {
  const inputRef = useRef<HTMLInputElement>(null);
  const overflowRef = useRef<HTMLDivElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [imageHeight, setImageHeight] = useState<number | null>(null);
  const [overflowHeight] = useState<number>(600);

  const [_imageLoading, setImageLoading] = useState<boolean>(false);
  const [isUploading, setIsUploading] = useState<boolean>(false);

  const overflowSize = (overflow: HTMLElement) => +overflow.scrollHeight - overflow.clientHeight;

  const setOverflowPosition = useCallback(
    (value: number) => {
      if (!overflowRef.current) return;
      const pos = (value / 100) * overflowSize(overflowRef.current);
      overflowRef.current.scrollTo({
        top: Number.isNaN(pos) ? 50 : parseFloat(pos.toFixed(1)),
        behavior: 'smooth',
      });
    },
    [overflowRef]
  );

  const getOverflowPosition = useCallback(() => {
    if (!overflowRef.current) return 50;
    const pos = Math.min(
      100,
      (100 * overflowRef.current.scrollTop) / overflowSize(overflowRef.current)
    );
    return Number.isNaN(pos) ? 50 : parseFloat(pos.toFixed(1));
  }, [overflowRef]);

  useEffect(() => {
    if (!item) return;
    if (showing instanceof URL)
      loadImage(
        showing.toString(),
        canvasRef.current,
        item,
        setImageHeight,
        setImageLoading,
        setOverflowPosition
      );
    if (showing instanceof File) {
      readLocalImage(
        showing,
        canvasRef.current,
        item,
        setImageHeight,
        setImageLoading,
        setOverflowPosition
      );
    }
  }, [showing, item, canvasRef, setOverflowPosition]);

  const changeFile: ChangeEventHandler<HTMLInputElement> = async (evt) => {
    const input = evt.target.files?.[0] ?? null;
    if (!input) return;

    onChangeShowing(() => input);
    await readLocalImage(
      input,
      canvasRef.current,
      item,
      setImageHeight,
      setImageLoading,
      setOverflowPosition
    );
    await uploadImage(input, setIsUploading);
  };

  useEffect(() => {
    setOverflowPosition(position);
  }, [position, setOverflowPosition]);

  const onScroll: UIEventHandler<HTMLDivElement> = useDebouncedCallback(
    () => onChangePosition(() => getOverflowPosition()),
    250
  );

  return (
    <>
      <input ref={inputRef} type='file' hidden onChange={changeFile} />
      <div className='relative'>
        <div
          ref={overflowRef}
          onScroll={onScroll}
          className='relative max-h-[600px] w-[1020px] overflow-y-scroll'
          style={{
            height: `${imageHeight ?? overflowHeight}px`,
            maxHeight: `${overflowHeight}px`,
          }}
        >
          <canvas
            ref={canvasRef}
            className='absolute w-[1000px]'
            onClick={() => inputRef?.current?.click()}
            style={{
              height: `${imageHeight ?? overflowHeight}px`,
            }}
          ></canvas>
        </div>
      </div>
      {isUploading ? <ProgressLinearInfinite title='Uploading' /> : ''}
    </>
  );
}

async function readLocalImage(
  file: File | null,
  preview: HTMLCanvasElement | null,
  item: Artwork,
  setImageHeight: Dispatch<SetStateAction<number | null>>,
  setImageLoading: Dispatch<SetStateAction<boolean>>,
  setOverflowPosition: Dispatch<number>
) {
  // Is a file selected?
  if (!file) {
    return;
  }

  // Is there a canvas ref?
  if (!preview) {
    return;
  }

  // Try and free an existing blob
  freeImage(preview);

  // Setup loading indicators
  setImageLoading(true);

  // Get file extension
  const match = /(?:\.([^.]+))?$/.exec(file.name);
  let blob: Blob | null = null;

  // Test for .tiff
  if (['.tiff', '.tif'].includes((match?.[0] ?? '').toLowerCase())) {
    blob = await loadTiffImage(file);
  } else {
    // Not .tiff, use response to blob
    blob = await new Response(file).blob();
  }

  if (!blob) {
    throw new Error("Couldn't collect image as blob");
  }

  await loadImage(
    // TODO(zevisert): replace this with createImageBitmap
    URL.createObjectURL(blob),
    preview,
    item,
    setImageHeight,
    setImageLoading,
    setOverflowPosition
  );
}

async function loadTiffImage(input: File): Promise<Blob | null> {
  const UTIF = await import('utif');
  const buffer = await new Response(input).arrayBuffer();

  const [ifd] = UTIF.decode(buffer);
  UTIF.decodeImage(buffer, ifd);

  const canvas = document.createElement('canvas');
  const ctx = canvas.getContext('2d');
  if (!ctx) {
    throw new Error("Couldn't get canvas context");
  }
  ctx.putImageData(
    new ImageData(new Uint8ClampedArray(UTIF.toRGBA8(ifd)), ifd.width, ifd.height),
    0,
    0
  );

  return await new Promise((resolve, reject) => {
    if (!canvas) reject();
    canvas.toBlob((blob) => resolve(blob));
  });
}

function freeImage(preview: HTMLElement) {
  if (preview.dataset.src && preview.dataset.src.startsWith('blob')) {
    URL.revokeObjectURL(preview.dataset.src);
  }
}

async function loadImage(
  source: string,
  preview: HTMLCanvasElement | null,
  item: Artwork,
  setImageHeight: Dispatch<SetStateAction<number | null>>,
  setImageLoading: Dispatch<SetStateAction<boolean>>,
  setOverflowPosition: Dispatch<number>
) {
  // Is there a canvas ref?
  if (!preview) {
    return;
  }

  // Has this image already been loaded?
  if (preview.dataset.src === source) {
    return;
  }

  await new Promise<void>((resolve) => {
    const img = new Image();
    img.onload = () => {
      preview.width = img.width;
      preview.height = img.height;

      setImageHeight((1000 / img.width) * img.height);

      const ctx = preview.getContext('2d');
      if (!ctx) {
        throw new Error("Couldn't get canvas context");
      }
      ctx.drawImage(img, 0, 0);
      setImageLoading(false);
      resolve();

      // Double rAF to ensure that the image scrolled
      requestAnimationFrame(() =>
        requestAnimationFrame(() => setOverflowPosition(item.metadata.display_position))
      );
    };

    img.src = preview.dataset.src = source;
  });
}

async function uploadImage(input: File, setIsUploading: Dispatch<SetStateAction<boolean>>) {
  setIsUploading(true);
  const _response = await fetch('/api/uploads', {
    method: 'POST',
    headers: {
      'Content-Type': input.type,
      'Content-Disposition': `attachment; filename="${input.name}"`,
    },
    body: await input.arrayBuffer(),
  });
  // TODO(zevisert): handle upload result - then set artwork image url
  // Maybe set the URL into local storage, so that you can carry on later without
  // having to upload again?
  setIsUploading(false);
}
