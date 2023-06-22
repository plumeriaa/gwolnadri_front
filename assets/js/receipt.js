

window.onload = async function Receipt() {
    // const urlParams = new URLSearchParams(window.location.search);
    // tid = urlParams.get('tid');

    const response = await fetch(`${backend_base_url}/api/v1/stores/payment/T48bf67e62ea0bae8e4f`,{
    })
    if (response.status == 200) {
        const response_json = await response.json()
        console.log(response_json)

        const get_aid = response_json.aid
        const get_approved = response_json.approved_at
        const get_item = response_json.item_name
        const get_order_id = response_json.partner_order_id
        const get_partner_user = response_json.partner_user_id
        const get_quantity = response_json.quantity
        const get_vat = response_json.vat_amount
        const get_total = response_json.total_amount

        const str_order_id = String(get_order_id).slice(0,4)+"********"
        const get_price = get_total - get_vat
        const date_approved = get_approved.split('T')[0]
        const time_approved = get_approved.split('T')[1].split('+')[0]
        const last_approved = date_approved + " " + time_approved

        const aid = document.getElementById('aid');
        const order = document.getElementById('order');
        const partner = document.getElementById('partner');
        const approved = document.getElementById('approved');
        const item = document.getElementById('item');
        const quantity = document.getElementById('quantity');
        const price = document.getElementById('price');
        const vat = document.getElementById('vat');
        const total = document.getElementById('total');

        aid.innerText = get_aid
        order.innerText = str_order_id
        partner.innerText = get_partner_user
        approved.innerText = last_approved
        item.innerText = get_item
        quantity.innerText = get_quantity
        price.innerText = get_price
        vat.innerText = get_vat
        total.innerText = get_total

    } else {
        alert(response.status)
    }
}