import Document, { DocumentContext, Head, Html, Main, NextScript } from 'next/document';

class MyDocument extends Document {
  static async getInitialProps(ctx: DocumentContext) {
    const initialProps = await Document.getInitialProps(ctx);
    return { ...initialProps };
  }

  render() {
    return (
      <Html lang='en'>
        <Head>
          <link
            rel='preload'
            href='/fonts/inter-var-latin.woff2'
            as='font'
            type='font/woff2'
            crossOrigin='anonymous'
          />

          <link
            rel='preload'
            as='style'
            href='https://fonts.googleapis.com/css?family=Julius+Sans+One|Thasadith:700|Syncopate&display=swap'
            crossOrigin='anonymous'
          />

          <link
            href='https://fonts.googleapis.com/css?family=Julius+Sans+One|Thasadith:700|Syncopate&display=swap'
            rel='stylesheet'
            crossOrigin='anonymous'
          />
        </Head>
        <body>
          <Main />
          <NextScript />
        </body>
      </Html>
    );
  }
}

export default MyDocument;
