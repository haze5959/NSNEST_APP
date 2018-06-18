import { SafeStyle } from "@angular/platform-browser/src/security/dom_sanitization_service";

export class schedule {
    scheduleId: number; 
    userId: number;
    title: string;
    description: string;
    startDate: Date;
    endDate: Date;
    participantsId: number[];
}