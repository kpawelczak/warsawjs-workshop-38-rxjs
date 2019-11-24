import { Component, OnInit } from '@angular/core';
import { of, interval, fromEvent, merge, from, BehaviorSubject, throwError } from 'rxjs';
import { map, filter, throttleTime, take, takeUntil, takeWhile, catchError, delay, concatAll, tap } from 'rxjs/operators'
import { ajax } from 'rxjs/ajax';
import { parse, stringify } from "query-string"

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.scss']
})
export class AppComponent implements OnInit {

  images = [
    'https://api.debugger.pl/assets/tomato.jpg',
    'https://api.debugger.pl/assets/pumpkin.jpg',
    'https://api.debugger.pl/assets/potatoes.jpg'
  ];

  contacts = [
    { images: this.images },
    { name: 'Joe', phone: 1234234 },
    { name: 'Mike', phone: 81234234 },
    { name: 'Bob', phone: 41234234 },
    { name: 'Jack', phone: 34234 },
    { name: 'Carlos', phone: 234234 }
  ];


  customOperator() {
    throw new Error("Method not implemented.");
  }

  higherOrder() {
    const urls = [
      'https://api.debugger.pl/big-deal/10000',
      'https://api.debugger.pl/big-deal/1000000',
      'https://api.debugger.pl/big-deal/1'
    ];

    from(urls)
      .pipe(
        map((val) => ajax(val)), //mergeMap((val) => ajax(val))
        concatAll(),        
        // tap(console.log),
        map(({response})=>response)
      )
      .subscribe(console.log)


    // from(this.contacts)
    //   .pipe(
    //     map((val) => of(val).pipe(delay(1000))),
    //     concatAll()
    //   )
    //   .subscribe(console.log)
  }

  hotvscold() {
    throw new Error("Method not implemented.");
  }

  operatorsCombination() {
    const mouseEvent$ = fromEvent(document, 'mousemove')
      .pipe(
        map(({ clientX, clientY }: MouseEvent) => ({ clientX, clientY })),
        throttleTime(100)
      )

    const clickEvent$ = fromEvent(document, 'click')
      .pipe(
        map(({ type }: MouseEvent) => ({ type }))
      )

    merge(
      mouseEvent$,
      clickEvent$
    )
      .subscribe(console.log)
  }

  operatorsTransformation() {
    throw new Error("Method not implemented.");
  }

  operatorsFiltering() {
    interval(1000)
      .pipe(
        take(25),
        takeWhile(i => i < 15),
        takeUntil(fromEvent(document, 'click'))
      )
      .subscribe(console.log,
        console.error,
        () => console.log('complete'))
  }

  subjects() {
    const filters = new BehaviorSubject({
      currentPage: 1,
      itemsPerPage: 21
    })

    filters.subscribe((val) => {
      const params = stringify(val);

      ajax(`https://api.debugger.pl/items?${params}`)
        .pipe(
          map(({ response }) => response),
          catchError((err) => {
            console.log(err)
            return throwError(err)
          })
        )
        .subscribe(console.log)
    })

    // filters.next({ ...filters.value, itemsPerPage: 25 })

    // fromEvent(document, 'click').subscribe(() => {
    //   filters.next({ ...filters.value, itemsPerPage: Math.ceil(Math.random() * 10) })
    // })
  }

  observables() {
    interval(1000)
      .pipe(
        map((i) => i + 1000),
        filter((i) => i % 2 === 0),
        take(25)
      )
    // .subscribe(console.log,
    //   null,
    //   () => console.log('complete')
    // )

    const mouseEvent$ = fromEvent(document, 'mousemove')
      .pipe(
        map(({ clientX, clientY }: MouseEvent) => ({ clientX, clientY })),
        throttleTime(100)
      )
    mouseEvent$.subscribe(console.log)
  }

  observableAndObserver() {
    of('hello')
      .subscribe(console.log,
        console.error,
        () => { console.log('complete') }
      )
  }

  constructor() {
    // this.observableAndObserver();
    // this.observables();
    // this.subjects();
    // this.operatorsFiltering();
    // this.operatorsTransformation();
    // this.operatorsCombination();
    // this.hotvscold();
    this.higherOrder()
    // this.customOperator();
  }

  ngOnInit() {

  }

}
