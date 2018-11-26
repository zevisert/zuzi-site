
// Return true if there's a problem
export const v8n = {
    price: ({price})        => ! price === Number(price).toString(),
    title: ({title})        => ! title.length > 0,
    descr: ({description})  => ! description.length > 0,
    sizes: ({sizes})        => ! (sz => typeof sz === 'object' && typeof sz.length === 'number' && sz.length > 0)(JSON.parse(sizes)),
    inven: ({inventory})    => ! inventory === parseInt(inventory).toString()
};
