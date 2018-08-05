import { Component, OnInit, ViewChild, ElementRef } from '@angular/core';
import { MatDialog, MatDialogRef, MAT_DIALOG_DATA, MatSnackBar, AUTOCOMPLETE_OPTION_HEIGHT } from '@angular/material';
import { ActivatedRoute, Router, Params } from '@angular/router';
import { DomSanitizer, SafeHtml } from '@angular/platform-browser';
import { posts } from '../model/posts';
import { marker } from '../model/marker';
import { user } from '../model/user';
import { comment } from '../model/comment';
import { ShowUserInfoDialog } from '../sideUserList/app.sideUserList';
import { ShowDetailImageDialog } from '../image-viewer/image-viewer.component';
import { HttpService } from '../service/http.service';
import { AppService } from '../service/appService';
import { environment } from '../../environments/environment';
import { CognitoUtil } from '../service/awsService/cognito.service';

import * as JSZip from '../../../node_modules/jszip/dist/jszip';
import * as JSZipUtils from '../../../node_modules/jszip-utils/dist/jszip-utils';
import { saveAs } from 'file-saver/FileSaver';
import { AppEmoticonDialog } from '../emoticonViewer/app.emoticonViewer';
import { promise } from 'protractor';

declare var cookieMaster;
declare var cordova;

@Component({
  selector: 'app-detail',
  templateUrl: './app.detail.html',
  styleUrls: ['./app.detail.css']
})
export class AppDetail implements OnInit {

  classify:string;
  isMine:boolean = false;
  postId:number;
  post:posts;
  safeHtml:SafeHtml;
  marker:marker;
  comments:comment[] = [];
  commentInput:string;

  constructor(private router: Router, public appService: AppService, private httpService: HttpService, private route: ActivatedRoute, public dialog: MatDialog, private sanitizer: DomSanitizer, public snackBar: MatSnackBar, private cognitoUtil: CognitoUtil) { }

  ngOnInit() {
    document.addEventListener("backbutton", () => {
      let element: HTMLElement = document.getElementById('backBtn') as HTMLElement;
      element.click();
    }, false);

    if(!this.appService.isAppLogin){
      this.router.navigate(['/']);
    } else {
      this.isMine = false;
      this.route.params.forEach((params: Params) => {
      this.postId = params['postId'];
    });

      //해당 게시글 DB에서 빼온다
      let parentClass = this;
      this.cognitoUtil.getAccessToken({
        callback(): void{},
        callbackWithParam(token: any): void {
          parentClass.httpService.checkAccessToken(token).then((accessToken) => {
            parentClass.httpService.getPost(accessToken, parentClass.postId)
            .subscribe(
              data => {
                // console.log(JSON.stringify(data));
                if (data.length == 0) { //게시글을 못찾음
                  alert("해당 게시글을 찾지 못하였습니다.");
                  parentClass.router.navigate(['/']);
                } else {
                  parentClass.post = parentClass.appService.postFactory(data)[0];
                  parentClass.appService.isAppLoading = false;
                  parentClass.initDetail();  //뷰 초기화
                }
              },
              error => {
                console.error("[error] - getPost:" + parentClass.postId);
                // this.post = this.httpService.errorPost;
                parentClass.appService.isAppLoading = false;
                parentClass.router.navigate(['/']);
              }
            );
          });
        }
      });
    }
  }

  initDetail(){
    if(this.appService.myInfo.userId == this.post.publisherId){
      //자기 자신의 글
      this.isMine = true;
    }

    switch(this.post['postClassify']){
      case 10:  //게시글
        this.classify = "post";
        this.safeHtml = this.sanitizer.bypassSecurityTrustHtml(this.post.body);

        setTimeout(() => {
          let elems:NodeListOf<Element> = document.querySelectorAll('.ql-editor > p > p > img');
          Array.from(elems).forEach((elem:Element) => { 
            elem.addEventListener('click', () => {
              this.openImageVeiwer(elem.getAttribute('src'));
            });
          });
        }, 1000);
        
        break;
      case 20:  //앨범
        this.classify = "elbum";
        break;
      case 30:  //지도
        this.classify = "map";
        this.marker = this.post['marker'];
        break;
      case 40:  //후방주의
        this.classify = "post";
        this.safeHtml = this.sanitizer.bypassSecurityTrustHtml(this.post.body);

        setTimeout(() => {
          let elems:NodeListOf<Element> = document.querySelectorAll('.ql-editor > p > p > img');
          Array.from(elems).forEach((elem:Element) => { 
            elem.addEventListener('click', () => {
              this.openImageVeiwer(elem.getAttribute('src'));
            });
          });
        }, 1000);
        break;
      default:
        this.classify = "error";
    }

    this.commentRefresh();
  }

  commentRefresh(){
    if(this.post['commentCount'] > 0){
      this.httpService.getComments(this.postId).subscribe(
        data => {
          // console.log(JSON.stringify(data));
          this.comments = this.appService.commentFactory(data);
          setTimeout(() => {
            let elems:NodeListOf<Element> = document.querySelectorAll('.comment-content > img');
            Array.from(elems).forEach((elem:Element) => { 
              elem.addEventListener('click', () => {
                this.openImageVeiwer(elem.getAttribute('src'));
              });
            });
          }, 1000);
        },
        error => {
          console.log(error);
          this.comments = [this.httpService.errorComment];
        }
      );
    }
  }
  
  pressOneUser(userId:number){
    //유저 DB에서 가져오기!
    this.httpService.getUser(userId).subscribe(
      data => {
        // console.log(JSON.stringify(data));
        if (data.length == 0) { //해당 유저를 못찾음
          alert("해당 유저를 찾지 못하였습니다.");
          throw("해당 유저를 찾지 못하였습니다.");
        } else {
          let user:user = this.appService.userFactory(data)[0];
          this.openUserDialog(user);
        }
      },
      error => {
        console.log(error);
        let user:user = this.httpService.errorUser;
        this.openUserDialog(user);
      }
    );
  }

  openUserDialog(user:user){
    const dialogRef = this.dialog.open(ShowUserInfoDialog, {
      height: this.appService.isPhone?"95%":"80%",
      width: this.appService.isPhone?"95%":"50%",
      data: user
    });

    dialogRef.afterClosed().subscribe(result => {
      console.log("Dialog result: ${result}");
    });
  }

  openEmoticonDialog(){
    const dialogRef = this.dialog.open(AppEmoticonDialog, {
      height: this.appService.isPhone?"95%":"80%",
      width: this.appService.isPhone?"95%":"50%"
    });

    dialogRef.afterClosed().subscribe(result => {
      if(result){
        let comment = `<img class="comment-img" src="${result}">`
        let paramJson = {
          postId: this.postId,
          // studentNum: 99,
          userId: this.appService.myInfo.userId,
          // userName: "에러",
          // userImg: null,
          emoticon: '',
          comment: comment
          // good: 0
        }

        this.httpService.postComment(paramJson, this.post.publisher).subscribe(
          data => {
            if(data.result){
              this.post.commentCount = this.post.commentCount + 1;
              this.commentInput = "";
              this.commentRefresh();
            } else {  //실패
              this.openSnackBar("서버가 불안정 합니다.");
              this.router.navigate(['/']);
            }
          },
          error => {
            console.log(error);
            alert(error);
          }
        );
      }
    });
  }

  pressImageDownload(images:Array<string>){
    var zip = new JSZip();
    var count = 0;
    images.forEach(function(url){
      console.log("url : " + url);
      var filename = url.substr(url.lastIndexOf('/') + 1);
      console.log("filename : " + filename);
      // loading a file and add it in a zip file
      JSZipUtils.getBinaryContent(url, function (err, data) {
        if(err) {
          console.error('이미지 압축 에러 - '+ err);
            throw err; // or handle the error
        }
        zip.file(filename, data, {binary:true});
        count++;
        if (count == images.length) {
          zip.generateAsync({compression:'STORE', type:'blob'}).then((zipFile) => {
            saveAs(zipFile, "NSNEST_IMAGES.zip");
            
          }).catch((err) => {
            console.error(err);
            alert(err);
          });
        }
      });
    });
  }

  openImageVeiwer(imageStr:string){
    cordova.InAppBrowser.open(imageStr, '_system', 'location=no,EnableViewPortScale=yes');  //_blank
    // var image = new Image();
    // image.src = imageStr;
    // image.onload = () => {
    //   let dialogRef = this.dialog.open(ShowDetailImageDialog, {
    //     maxHeight: '100vmin',
    //     height: image.height.toString(),
    //     width: image.width.toString(),
    //     data: { imageUrl: imageStr }
    //   });

    //   dialogRef.afterClosed().subscribe(result => {});
    // }
  }

  pressCommentRegist(comment:string){
    console.log("코맨트 : " + comment);
    
    if(comment == ""){
      this.openSnackBar("코멘트를 입력해주세요.");
    }else{
      //코멘트 등록 후 업데이트
      let paramJson = {
        postId: this.postId,
        // studentNum: 99,
        userId: this.appService.myInfo.userId,
        userName: this.appService.myInfo.name,
        // userImg: null,
        emoticon: '',
        comment: comment
        // good: 0
      }

      this.httpService.postComment(paramJson, this.post.publisher).subscribe(
        data => {
          // console.log(JSON.stringify(data));
          if(data.result){
            this.post.commentCount = this.post.commentCount + 1;
            this.commentInput = "";
            this.commentRefresh();
          } else {  //실패
            this.openSnackBar("서버가 불안정 합니다.");
            this.router.navigate(['/']);
          }
        },
        error => {
          console.log(error);
          alert(error);
        }
      );
    }
  }

  pressGood(postId:number){ //좋아요
    var isAlreayVote = true;
    var userGoodBadInfo = null;

    new Promise((resolve, reject) => {
      //쿠키 가져오기==================================================
      cookieMaster.getCookieValue(environment.fileUrl, 'nsnest_good_bad_info', function(data) {
        userGoodBadInfo = data.cookieValue;
        let usedPostIdArr:string[] = userGoodBadInfo.split(',');
        var isContainPostId:boolean = false;
        for (const usedPostId of usedPostIdArr) {
          if (usedPostId == postId.toString()) {
            isContainPostId = true;
          }
        }

        if(!isContainPostId){
          isAlreayVote = false;
        }

        resolve();
      }, function(error) {
        isAlreayVote = false;
        resolve();
      });
      //=========================================================
    }).then(() => {
      if(isAlreayVote){ //이미 사용하셨습니다.
        this.openSnackBar("이미 투표하셨습니다.");
      } else {
        let parentClass = this;
        this.cognitoUtil.getAccessToken({
          callback(): void{},
          callbackWithParam(token: any): void {
            parentClass.httpService.checkAccessToken(token).then((accessToken) => {
              parentClass.httpService.putPostGoodBad(accessToken, postId, parentClass.appService.myInfo.userId, true).subscribe(
                data => {
                  // console.log(JSON.stringify(data));
                  if(data.result){
                    parentClass.openSnackBar("좋아요 성공");
      
                    //쿠키 적용하기==================================================
                    if(!userGoodBadInfo){
                      userGoodBadInfo = postId.toString();
                    } else {
                      userGoodBadInfo = userGoodBadInfo.concat(',' + postId.toString())
                    }
      
                    cookieMaster.setCookieValue(environment.fileUrl, 'nsnest_good_bad_info', userGoodBadInfo,
                    function() {},
                    function(error) {
                        alert('Error setting cookie: '+error);
                    });
                    //=========================================================
      
                    parentClass.post.good = parentClass.post.good + 1;
                  } else {
                    parentClass.openSnackBar("좋아요 실패");
                  }
                },
                error => {
                  console.log(error);
                  parentClass.openSnackBar("좋아요 실패 - " + error);
                }
              ); 
            });
          }
        });
      }
    });
  }

  pressBad(postId:number){  //싫어요
    var con_test = confirm("해당 게시글을 신고하시겠습니까?");
    if(con_test == true){
      var isAlreayVote = true;
      var userGoodBadInfo = null;
      
      new Promise((resolve, reject) => {
        //쿠키 가져오기==================================================
        cookieMaster.getCookieValue(environment.fileUrl, 'nsnest_good_bad_info', function(data) {
          userGoodBadInfo = data.cookieValue;
          let usedPostIdArr:string[] = userGoodBadInfo.split(',');
          var isContainPostId:boolean = false;
          for (const usedPostId of usedPostIdArr) {
            if (usedPostId == postId.toString()) {
              isContainPostId = true;
            }
          }

          if(!isContainPostId){
            isAlreayVote = false;
          }

          resolve();
        }, function(error) {

          isAlreayVote = false;
          resolve();
        });
        //=========================================================
      }).then(() => {
        if(isAlreayVote){ //이미 사용하셨습니다.
          this.openSnackBar("이미 신고된 게시글입니다.");
        } else {
          let parentClass = this;
          this.cognitoUtil.getAccessToken({
            callback(): void{},
            callbackWithParam(token: any): void {
              parentClass.httpService.checkAccessToken(token).then((accessToken) => {
                parentClass.httpService.putPostGoodBad(accessToken, postId, parentClass.appService.myInfo.userId, false).subscribe(
                  data => {
                    if(data.result){
                      parentClass.openSnackBar("게시글 신고 완료");
      
                      //쿠키 적용하기==================================================
                      if(!userGoodBadInfo){
                        userGoodBadInfo = postId.toString();
                      } else {
                        userGoodBadInfo = userGoodBadInfo.concat(',' + postId.toString())
                      }
                      
                      cookieMaster.setCookieValue(environment.fileUrl, 'nsnest_good_bad_info', userGoodBadInfo,
                      function() {},
                      function(error) {
                          alert('Error setting cookie: '+error);
                      });
                      //=========================================================
      
                      parentClass.post.bad = parentClass.post.bad + 1;
                    } else {
                      parentClass.openSnackBar("게시글 신고 실패");
                    }
                  },
                  error => {
                    console.log(error);
                    parentClass.openSnackBar("게시글 신고 실패 - " + error);
                  }
                );
              });
            }
          });
        }
      });
    }
  }

  pressDeletePost(postId:number){ //게시글 삭제
    let parentClass = this;
    this.cognitoUtil.getAccessToken({
      callback(): void{},
      callbackWithParam(token: any): void {
        parentClass.httpService.checkAccessToken(token).then((accessToken) => {
          parentClass.httpService.deletePost(accessToken, postId).subscribe(
            data => {
              console.log(JSON.stringify(data));
              if(data.result){
                parentClass.openSnackBar("게시글 삭제 성공");
                parentClass.router.navigate(['/']);
              } else {
                parentClass.openSnackBar("게시글 삭제 실패");
              }
            },
            error => {
              console.log(error);
              parentClass.openSnackBar("게시글 삭제 실패 - " + error);
            }
          );
        });
      }
    });
  }

  pressDeleteComment(commentId:number){
    this.httpService.deleteComment(commentId, this.postId).subscribe(
      data => {
        console.log(JSON.stringify(data));
        if(data.result){
          this.openSnackBar("코멘트 삭제 성공");
          this.commentRefresh();
        } else {
          this.openSnackBar("코멘트 삭제 실패");
        }
      },
      error => {
        console.log(error);
        this.openSnackBar("코멘트 삭제 실패 - " + error);
      }
    );
  }

  openSnackBar(message: string) {
    this.snackBar.open(message, null, {
      duration: 2000,
    });
  }

  replaceLineBreak(s:string) {
    return s && s.replace(/\n/gi,'<br />');
  }

  uploadImages($event){
    this.appService.isAppLoading = true;

    let parentClass = this;
    this.cognitoUtil.getAccessToken({
      callback(): void{},
      callbackWithParam(token: any): void {
        parentClass.httpService.checkAccessToken(token).then((accessToken) => {
          parentClass.httpService.uploadImage(accessToken, 'board', $event.target.files[0])
          .subscribe(
            data => {
              // console.log(JSON.stringify(data));
              if(data.result){  //성공
                const fileInfo = data.message.files.file;
                if(fileInfo && fileInfo.path){
                  let filePath:string = fileInfo.path;
                  filePath = filePath.replace('/1TB_Drive/NSNEST_PUBLIC/', '');
                  const fileUrl = environment.fileUrl + filePath;
                  console.log('이미지 업로드 완료 - ' + fileUrl);
                  parentClass.pressCommentRegist(`<img class="comment-img" src="${fileUrl}">`);
                } else {
                  throw new Error('이미지 형식이 이상합니다.');
                }
                
                parentClass.snackBar.open(`이미지 업로드 완료`, "확인");
                parentClass.appService.isAppLoading = false;
          
              } else {  //실패
                console.error("이미지 업로드 실패 - " + data.message);
                alert("이미지 업로드 실패 - " + data.message);
                parentClass.appService.isAppLoading = false;
              }
            },
            error => {
              console.error("이미지 업로드 실패 - " + error.message);
              alert(`이미지 업로드 실패 - ` + error.message);
              parentClass.appService.isAppLoading = false;
            }
          );
        });
      }
    });
  }

  historyBack(){
    // this.appService.goBack();

    if(this.appService.engagingMainPage == 'newspeed'){
      this.router.navigate(['/']);
    } else if(this.appService.engagingMainPage == 'tastyLoad'){
      this.router.navigate(['/tastyLoad']);
    } else {
      this.router.navigate(['/']);
    }
  }
}