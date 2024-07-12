import { AbstractControl, ValidatorFn } from '@angular/forms';

export function fileSizeValidator(maxSize: number): ValidatorFn {
  return (control: AbstractControl): { [key: string]: any } | null => {
    const file = control.value;
    if (file && file.size > maxSize) {
      return { 'fileSize': { value: control.value } };
    }
    return null;
  };
}
