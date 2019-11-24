const { webSocket } = rxjs.webSocket;
const { fromEvent, Subject, of, merge, throwError } = rxjs;
const { groupBy, mergeMap, scan, throttleTime, switchMap, delay, map, filter, catchError, retry, retryWhen } = rxjs.operators;
import { getUser, register } from './service.js'


const rank$ = new Subject();

rank$
    .pipe(
        groupBy((value) => value.username),
        mergeMap((g) => g.pipe(
            filter((val) => val.score !== undefined),
            scan((acc, item) => ({ ...acc, [g.key]: item.score }), {})
        )),
        scan((acc, item) => ({ ...acc, ...item }), {}),
        map((val) => Object.entries(val).sort((a, b) => a[1] - b[1]).reverse())
    )
    .subscribe((val) => {
        els.rank.innerHTML = `${val.map((item) => `<div>${item[0]}: ${item[1]}</div>`).join('')}`
    })


const els = {
    box: document.querySelector('.box'),
    count: document.querySelector('.count > span'),
    rank: document.querySelector('.rank')
}

const ws$ = webSocket('wss://demo-game.debugger.pl');

function createUser(username) {
    const el = document.createElement('div');
    el.classList.add('el');
    el.id = username;
    els.box.appendChild(el);
    return el;
}

function updateUser({ type, username, clientX, clientY, score }) {
    let el = document.querySelector(`#${username}`);
    el = el || createUser(username);
    el.innerHTML = `${username} <br> ${(score || '')}`
    el.style.left = clientX - el.offsetWidth / 2 + "px";
    el.style.top = clientY - el.offsetHeight / 2 + "px";
}

function init() {
    ws$
        .subscribe(
            (message) => {
                els.count.innerHTML = message.size
                updateUser(message)
                rank$.next(message)
            }
        )

    fromEvent(document, 'mousemove')
        .pipe(
            map(({ clientX, clientY }) => ({ clientX, clientY })),
            throttleTime(30)
        )
        .subscribe(
            (s) => {
                ws$.next(s)
            }
        )

    fromEvent(document, 'click')
        .pipe()
        .subscribe(({ target }) => {
            if (target.id === 'gift') {
                ws$.next({ type: 'hit' })
            }
        })

}

function userNotFound(err) {
    of('your name')
        .pipe(
            map(() => prompt('xx')),
            switchMap((val) => register(val)),
            catchError((err) => {
                alert(JSON.stringify(err))
                return throwError(err)
            }),
            retry(3)
        )
        .subscribe(init)
}

getUser().subscribe(
    init,
    (err) => {
        userNotFound(err)
    }
)
