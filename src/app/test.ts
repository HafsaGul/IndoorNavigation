import * as Rx from 'rxjs';
import {publish, refCount} from 'rxjs/operators';

let obs =
Rx.Observable 
.create(observer => setTimeout( ()=> observer.next(Date.now()) , 1000) )
.pipe(
publish(),
refCount()
); 
obs.subscribe(v => console.log("1st subscriber: " + v)); 
obs.subscribe(v => console.log("2nd subscriber: " + v)); 