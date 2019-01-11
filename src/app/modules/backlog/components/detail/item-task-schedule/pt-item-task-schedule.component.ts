import { Component, Input, ChangeDetectionStrategy, Output, EventEmitter, OnInit } from '@angular/core';
import { FormGroup, FormBuilder, Validators } from '@angular/forms';

import { PtTask } from '../../../../../core/models/domain';
import { PtNewTask, PtTaskUpdate } from '../../../../../shared/models/dto';
import { EMPTY_STRING } from '../../../../../core/helpers/string-helpers';
import { BehaviorSubject } from 'rxjs';
import { SchedulerEvent, SaveEvent } from '@progress/kendo-angular-scheduler';


@Component({
    selector: 'app-item-task-schedule',
    templateUrl: 'pt-item-task-schedule.component.html',
    styleUrls: ['pt-item-task-schedule.component.css'],
    changeDetection: ChangeDetectionStrategy.OnPush
})
export class PtItemTaskScheduleComponent implements OnInit {

    @Input() public tasks$: BehaviorSubject<PtTask[]> = new BehaviorSubject<PtTask[]>([]);

    @Output() addNewTask = new EventEmitter<PtNewTask>();
    @Output() updateTask = new EventEmitter<PtTaskUpdate>();

    public newTaskTitle = EMPTY_STRING;
    private lastUpdatedTitle = EMPTY_STRING;

    public displayDate = new Date();
    public startTime = '07:00';
    public events: SchedulerEvent[] = [];
    public formGroup: FormGroup | undefined;

    constructor(private formBuilder: FormBuilder) {
        this.createFormGroup = this.createFormGroup.bind(this);
    }

    public ngOnInit() {
        this.tasks$.subscribe(tasks => {
            const sevents = tasks.filter(t => t.dateStart && t.dateEnd).map(t => {
                const evt: SchedulerEvent = {
                    id: t.id,
                    title: t.title ? t.title : '',
                    start: t.dateStart ? t.dateStart : new Date(),
                    end: t.dateEnd ? t.dateEnd : new Date(),
                    isAllDay: false
                };
                return evt;
            });
            this.events = sevents;
            const minDate = new Date(Math.min.apply(null, sevents.map((e) => new Date(e.start).valueOf())));
            this.displayDate = minDate;
        });
    }

    public createFormGroup(args: any): FormGroup {
        const ev = args.event;

        this.formGroup = this.formBuilder.group({
            'id': args.isNew ? this.getNextId() : ev.id,
            'start': [ev.start, Validators.required],
            'end': [ev.end, Validators.required],
            'startTimezone': [ev.startTimezone],
            'endTimezone': [ev.endTimezone],
            'isAllDay': ev.isAllDay,
            'title': ev.title,
            'description': ev.description,
            'recurrenceRule': ev.recurrenceRule
        });

        return this.formGroup;
    }

    public getNextId(): number {
        const len = this.events.length;
        return (len === 0) ? 1 : this.events[this.events.length - 1].id + 1;
    }

    public save(args: SaveEvent) {
        if (args.isNew) {
            const newTask: PtNewTask = {
                // TODO: Change this to appropriate collection when implemented in scheduler
                title: args.formGroup.controls['title'].value,
                completed: false,
                dateStart: args.formGroup.controls['start'].value,
                dateEnd: args.formGroup.controls['end'].value
            };
            this.addNewTask.emit(newTask);
        } else {
            const taskToUpdate = this.tasks$.value.find(t => t.id === args.event.id);
            if (taskToUpdate) {
                // TODO: Change this to appropriate collection when implemented in scheduler
                taskToUpdate.title = args.formGroup.controls['title'].value;
                taskToUpdate.dateStart = args.event.start;
                taskToUpdate.dateEnd = args.event.end;
                const taskUpdate: PtTaskUpdate = {
                    task: taskToUpdate,
                    toggle: false
                };
                this.updateTask.emit(taskUpdate);
            }
        }
    }

    public onAddTapped(newTaskTextField: any) {
        const newTitle = this.newTaskTitle.trim();
        if (newTitle.length === 0) {
            return;
        }
        const newTask: PtNewTask = {
            title: newTitle,
            completed: false
        };
        this.addNewTask.emit(newTask);
        this.newTaskTitle = EMPTY_STRING;
    }

    public toggleTapped(task: PtTask) {
        const taskUpdate: PtTaskUpdate = {
            task: task,
            toggle: true
        };
        this.updateTask.emit(taskUpdate);
    }

    public taskTitleChange(task: PtTask, newTitle: string) {
        if (task.title === newTitle) {
            return;
        }
        this.lastUpdatedTitle = newTitle;
    }

    public taskBlurred(task: PtTask) {
        if (task.title === this.lastUpdatedTitle) {
            return;
        }
        const taskUpdate: PtTaskUpdate = {
            task: task,
            toggle: false,
            newTitle: this.lastUpdatedTitle
        };
        this.updateTask.emit(taskUpdate);
        this.lastUpdatedTitle = EMPTY_STRING;
    }

    public taskDelete(task: PtTask) {
        const taskUpdate: PtTaskUpdate = {
            task: task,
            toggle: false,
            delete: true
        };
        this.updateTask.emit(taskUpdate);
    }
}
