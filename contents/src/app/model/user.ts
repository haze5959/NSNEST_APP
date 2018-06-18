import { SafeStyle } from "@angular/platform-browser/src/security/dom_sanitization_service";

export class user {
    userId?: number;
    cognitoSub?: string;
    studentNum?: number;
    name?: string;
    birthDay?: Date;
    gender?: string;
    image: string;
    intro?: string;
    description?: string;
    recentDate?: Date;  //접속일이 아닌 프로필 수정이나 게시글 올렸을 때 활동일
    subImage01?: string;
    point?: number;
}