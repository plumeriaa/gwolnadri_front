window.onload = async function SelectTicket(event_id) {
    let urlParams = new URLSearchParams(window.location.search);
    event_id = urlParams.get('event_id');

    const eventData = await fetch(`${backend_base_url}/events/1/`, {
    })
    if (eventData.status == 200) {
        const eventData_json = await eventData.json()
        console.log(eventData_json)

        const origin_min_date = eventData_json.event_start_date
        const origin_max_date = eventData_json.event_end_date

        const min_date = origin_min_date.split('.')
        const max_date = origin_max_date.split('.')

        const start_date = "20"+min_date[0]+'-'+min_date[1]+'-'+min_date[2]
        const end_date = "20"+max_date[0]+'-'+max_date[1]+'-'+max_date[2]

        let now_utc = Date.now()
        let timeOff = new Date().getTimezoneOffset()*60000;
        let tomorrow = new Date(now_utc-timeOff+86400000).toISOString().split("T")[0];

        const date = document.getElementById('rsrvt_date');

        if (start_date < tomorrow) {
            console.log("tomorrow : "+`${tomorrow}`+" > "+"start_date : "+`${start_date}`)
            date.setAttribute("min",`${tomorrow}`)
        } else {
            console.log("start_date : "+`${start_date}`+" > "+"tomorrow : "+`${tomorrow}`)
            date.setAttribute("min",`${start_date}`)
        }

        date.setAttribute("max",`${end_date}`)

    } else {
        console.log(eventData_json)
        alert(eventData.status,"잘못된 상품 정보입니다")
        window.location.href = `${frontend_base_url}`
    }
}

async function SelectDate(){

    const v_date = document.getElementById('rsrvt_date').value;

    const eventTime = await fetch(`${backend_base_url}/events/1/${v_date}/ticket/`, {
        headers: {
            "Authorization": `Bearer ${token}`
        }
    })
    if (eventTime.status == 200) {
        const eventTime_json = await eventTime.json()
        console.log(eventTime_json)

        let e_date = document.getElementById('rsrvt_date');
        let btn_date = document.getElementById('select_date');
        e_date.disabled = true;
        btn_date.disabled = true;

        const selectTime = document.getElementById('selectTime');
        const timeList = document.getElementById('timeList');
        const opt_title = document.getElementById('opt_title');
        timeList.disabled = false;
        selectTime.disabled = false;
        opt_title.innerText = "행사 시간 || 잔여 좌석"

        
        for (let i = 0; i < eventTime_json.length; i++) {
            const times = eventTime_json[i]
            console.log(times)
            
            const current = times.current_booking
            const max_booking = times.max_booking_count
            const num = max_booking - current
            const event_time = times.event_time
            const ticket_id = times.id
            
            const opt = document.createElement("option")
            opt.innerText = event_time + " || " + "잔여 : " + num + "석"
            
            timeList.appendChild(opt)
        }

    } else if (eventTime.status == 404) {
        alert("다시 선택해주세요")

    } else {
        console.log(eventTime)
        alert(eventTime.status,"잘못된 상품 정보입니다")
        // window.location.href = `${frontend_base_url}`
    }
}


async function SelectTime(){
    const v_date = document.getElementById('rsrvt_date').value;
    const v_time = document.getElementById('timeList').value;
    const s_time = v_time.split(' ')[0]

    console.log(s_time)

    if (s_time == "행사") {
        alert("다시 선택해주세요")

    } else {
        const eventBooking = await fetch(`${backend_base_url}/events/1/${v_date}/${s_time}/ticket/`, {
            headers: {
                "Authorization": `Bearer ${token}`
            }
        })
        if (eventBooking.status == 200) {
            const eventBooking_json = await eventBooking.json()
            console.log(eventBooking_json)

            let e_time = document.getElementById('timeList');
            let btn_time = document.getElementById('selectTime');
            let selectQuantity = document.getElementById('quantity');
            let Kakaopay = document.getElementById('select')
            e_time.disabled = true;
            btn_time.disabled = true;
            selectQuantity.disabled = false;

            for (let i = 0; i < eventBooking_json.length; i++) {
                const booking = eventBooking_json[i]
                console.log(booking)

                const max_booking = booking.max_booking_count
                const current = booking.current_booking
                const ticket_id = booking.id
                const now = max_booking - current

                selectQuantity.setAttribute("max",`${now}`)
                Kakaopay.setAttribute("onClick", `handleSelectEvent(${ticket_id})`)
            }
        } else {
            console.log(eventBooking)
            alert(eventBooking.status,"잘못된 상품 정보입니다")
            // window.location.href = `${frontend_base_url}`
        }
    }
}


async function handleSelectEvent(ticket_id) {
    let urlParams = new URLSearchParams(window.location.search);
    event_id = urlParams.get('event_id');

    const quantity = document.getElementById('quantity').value;
    const int_quantity = Number(quantity)

    if (int_quantity == 0) {
        alert("다시 선택해주세요")
        location.reload()

    } else {
        const eventticket = await fetch(`${backend_base_url}/events/2/ticket/`, {
        })
        if (eventticket.status == 200) {
            const eventticket_json = await eventticket.json()
            console.log(eventticket_json)

            const max_booking = eventticket_json.max_booking_count
            const current = eventticket_json.current_booking

            if (int_quantity + current > max_booking) {
                console.log(eventticket_json)
                alert("티켓의 잔여 수량이 모자랍니다")
                location.reload()

            } else if (int_quantity + current <= max_booking) {

                const date = document.getElementById('rsrvt_date').value;
                const v_time = document.getElementById('timeList').value;
                const time = v_time.split(' ')[0]
                const r_time = time.split('~')[0]
                console.log(r_time)
                console.log(date)
                console.log(time)
                console.log(quantity)

                first = date.split('-')
                first2 = first[2].split('')
                middle1 = time.split(':')[0].split('')
                middle2 = time.split(':')[1].split('~')[1].split('')

                //  ----2023(ticket_id)
                const order_id = first2[1]+middle1[1]+middle2[1]+first2[0]+first[0]+`${ticket_id}`
                console.log(order_id)
                console.log(`${ticket_id}`)

                // 행사 정보 조회
                const response = await fetch(`${backend_base_url}/events/1/`, {
                })
                
                if (response.status == 200) {
                    const response_json = await response.json()
                    console.log(response_json)

                    const item = response_json.title
                    const order_stf_id = response_json.author
                    const original_price = response_json.money

                    const price = original_price * int_quantity
                    const vat = price * 0.1
                    const total = price + vat

                    // 카카오 결제 신청
                    const kakao_pay = await fetch("https://kapi.kakao.com/v1/payment/ready", {
                        headers:{
                            "Authorization": "KakaoAK c852f123396eb62c459e2f8c0ddf1a30",
                            "Content-Type": "application/x-www-form-urlencoded"
                        },
                        method: 'POST',
                        body: new URLSearchParams({
                            "cid": "TC0ONETIME",
                            "partner_order_id": order_id,
                            "partner_user_id": order_stf_id,
                            "item_name": item,
                            "quantity": int_quantity,
                            "total_amount": total,
                            "vat_amount": vat,
                            "tax_free_amount": 0,
                            "approval_url": `${frontend_base_url}/complete.html`,
                            "fail_url": `${frontend_base_url}`,
                            "cancel_url": `${frontend_base_url}`
                        })
                    });

                    console.log(kakao_pay)
                    
                    if (kakao_pay.status == 200) {
                        alert("결제요청 완료")

                        const kakao_json = await kakao_pay.json()
                        console.log(kakao_json)

                        const tid = kakao_json.tid
                        const created_at = kakao_json.created_at
                        const next_url_m = kakao_json.next_redirect_mobile_url
                        const next_url_p = kakao_json.next_redirect_pc_url
                        
                        setCookie("tid", tid, 2);
                        
                        // DB에 결제요청건 저장
                        const send = await fetch(`${backend_base_url}/api/v1/stores/payment/${payload_parse.user_id}/`, {
                            headers: {
                                "Authorization": `Bearer ${token}`,
                                'content-type': 'application/json'
                            },
                            method: 'POST',
                            body: JSON.stringify({
                                "tid": tid,
                                "type":"event",
                                "created_at": created_at,
                                "partner_order_id": order_id,
                                "partner_user_id": order_stf_id,
                                "item_name": item,
                                "quantity": int_quantity,
                                "total_amount": total,
                                "vat_amount": vat,
                                "rsrvt_date": date,
                                "rsrvt_time": r_time
                            })
                        })
                        console.log(send)

                        if (send.status == 200) {
                            alert("db 저장완료")
                            window.location.href = next_url_p
                        } else {
                            alert("db 저장실패",send.status)
                            // window.location.href = `${frontend_base_url}`
                        }

                    } else {
                        console.log(kakao_pay.status)
                        alert("결제요청 실패",kakao_pay.status)
                    }

                } else {
                    console.log(response_json)
                    alert(response.status,"잘못된 상품 정보입니다")
                    goBack()
                    window.location.href = `${frontend_base_url}`
                }
            }
        } else {
            console.log(eventticket_json)
            alert(eventticket.status,"잘못된 상품 정보입니다")
            goBack()
            window.location.href = `${frontend_base_url}`
        }
    }
}

// 페이지 새로고침
async function onClickReload() {
    location.reload()
}