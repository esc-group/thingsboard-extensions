import { ChangeDetectorRef, Component, Input, OnInit } from '@angular/core';
import { PageComponent } from '@shared/public-api';
import { ProgramHandsetRpc } from '../models';
import { FormControl, FormGroup, Validators } from '@angular/forms';
import { Store } from '@ngrx/store';
import { AppState } from '@core/core.state';
import { SpectralinkService } from '../spectralink.service';
import { BehaviorSubject } from 'rxjs';
import { ThemePalette } from '@angular/material/core';

@Component({
  selector: 'ats-spectralink-program',
  templateUrl: './spectralink-program.component.html',
  styleUrls: ['./spectralink-program.component.scss'],
})
export class SpectralinkProgramComponent extends PageComponent implements OnInit {
  @Input() gatewayId: string;

  form = new FormGroup({
    ipAddress: new FormControl<string>(undefined, [Validators.required, Validators.minLength(1)]),
    line: new FormControl<number>(1, [Validators.required, Validators.min(1), Validators.max(6)]),
    username: new FormControl<string>('Admin', [Validators.required, Validators.minLength(1)]),
    password: new FormControl<string>('456', [Validators.required, Validators.minLength(1)]),
  });

  programming$ = new BehaviorSubject<boolean>(false);
  programDisabled$ = new BehaviorSubject<boolean>(false);

  resultShow$ = new BehaviorSubject<boolean>(false);
  resultColor$ = new BehaviorSubject<ThemePalette>(undefined);
  resultMessage$ = new BehaviorSubject<string>('');

  constructor(
    protected store: Store<AppState>,
    private spectralinkService: SpectralinkService,
    private cdRef: ChangeDetectorRef
  ) {
    super(store);
  }

  getProgramDisabled = (): boolean => {
    return this.programming$.value || !this.form.valid || this.resultShow$.value;
  };

  ngOnInit(): void {
    this.form.statusChanges.subscribe(() => {
      this.programDisabled$.next(this.getProgramDisabled());
    });
    this.programming$.subscribe((value) => {
      this.programDisabled$.next(this.getProgramDisabled());
    });
    this.resultShow$.subscribe(() => {
      this.programDisabled$.next(this.getProgramDisabled());
    });
  }

  showResult = (message: string, success: boolean): void => {
    this.resultColor$.next(success ? 'primary' : 'warn');
    this.resultMessage$.next(message);
    this.resultShow$.next(true);
    setTimeout(this.hideResult, 6000);
    this.cdRef.detectChanges();
  };

  hideResult = () => {
    this.resultShow$.next(false);
    this.cdRef.detectChanges();
  };

  onProgram = (): void => {
    this.programming$.next(true);
    this.spectralinkService.programHandset(this.gatewayId, this.form.value as ProgramHandsetRpc).subscribe({
      next: (success: boolean): void => {
        this.showResult('Programming ' + (success ? 'Success' : 'Failed'), success);
      },
      error: (error: any): void => {
        this.showResult('Error ' + error.toString(), false);
      },
      complete: (): void => {
        this.programming$.next(false);
      },
    });
  };
}
