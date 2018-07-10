import { Component, OnInit, ViewChild, ElementRef } from '@angular/core';
import { FormControl, Validators } from '@angular/forms';
import { MatDialog, MatDialogRef, MAT_DIALOG_DATA, MatSnackBar } from '@angular/material';
import { ActivatedRoute, Router, Params } from '@angular/router';
import { ShowDetailImageDialog } from '../image-viewer/image-viewer.component';
import { environment } from '../../environments/environment';
import { marker } from "../model/marker";
import { AppService } from '../service/appService';
import { HttpService } from '../service/http.service';
import { posts } from '../model/posts';
import { AppEmoticonDialog } from '../emoticonViewer/app.emoticonViewer';
import { promise } from 'selenium-webdriver';

@Component({
  selector: 'app-write',
  templateUrl: './app.write.html',
  styleUrls: ['./app.write.css']
})
export class AppWrite implements OnInit {

  @ViewChild('fileInput') fileInputEl:ElementRef;

  classify:string;

  constructor(private router: Router,private activeRoute: ActivatedRoute, private ElementRef:ElementRef, public dialog: MatDialog, private appService: AppService, public snackBar: MatSnackBar, private httpService: HttpService) { 
    
  }

  titleFormControl = new FormControl('', [Validators.required]);
  editorContent = new FormControl('', [Validators.required]);
  quillInstance;
  imageArr = new Array();
  selectType = "restaurant";
  marker?: marker;

  editorModule = {
    toolbar: [
      ['bold', 'italic', 'underline'],        // toggled buttons
      ['blockquote', 'code-block'],
  
      [{ 'script': 'sub'}],      // superscript/subscript
  
      [{ 'size': ['small', false, 'large', 'huge'] }],  // custom dropdown
  
      [{ 'color': [] }, { 'background': [] }],          // dropdown with defaults from theme
      [{ 'align': [] }],
  
      ['image', 'video']                         // link and image, video
    ]
  };

  protected map: any;
  protected mapReady(map) {
    this.map = map;
  }

  ngOnInit(): void {
    if(!this.appService.isAppLogin){
      this.router.navigate(['/']);
    } else {
      this.activeRoute.params.forEach((params: Params) => {
        this.classify = params['classify'];
        this.marker = null;
        this.selectType = "restaurant";
        this.imageArr = new Array();
        this.editorContent.reset();
      });
  
      this.appService.isAppLoading = false;
    }
  }

  //글 등록!
  pressSaveBtn() {
    
      var post:posts = {  //게시글 뼈대 제작
        postClassify: 0,
        studentNum: this.appService.myInfo.studentNum,
        publisherId: this.appService.myInfo.userId,
        publisher: this.appService.myInfo.name,
        publisherIntro: this.appService.myInfo.intro,
        publisherImg: this.appService.myInfo.image,
        images: null,
        title: '',
        body: '',
        marker: null,
        tag: null
      };

      this.appService.isAppLoading = true;
      
      switch(this.classify){
        case 'post':{ //게시글
          if(this.editorContent.valid && this.titleFormControl.valid){
            post.postClassify = 10;
            post.title = this.titleFormControl.value; //제목입력
            post.body = this.editorContent.value; //본문입력
            this.httpService.postPost(post)
            .subscribe(
              data => {
                this.appService.isAppLoading = false;
                console.log(JSON.stringify(data));
                if(data.result){  //성공
                  this.appService.newspeedPosts = []; //초기화
                  this.snackBar.open("게시글 업로드 완료", "확인", {
                    duration: 2000,
                  });
                  this.router.navigate(['/']);
                } else {  //실패
                  this.snackBar.open("게시글 업로드 실패 - " + data.message, "확인", {
                    duration: 5000,
                  });
                }
              },
              error => {
                this.appService.isAppLoading = false;
                console.error("[error] - " + error.error.text);
                alert("[error] - " + error.error.text);
              }
            );
          } else {  //벨리데이션 실패
            this.appService.isAppLoading = false;
            this.snackBar.open("제목과 본문을 작성하시오.", "확인", {
              duration: 2000,
            });
          }
          
          break;
        }  
        case 'elbum':{ //앨범
          if(this.editorContent.valid){
            post.postClassify = 20;
            post.body = this.editorContent.value; //본문입력
            post.images = this.imageArr;
            this.httpService.postPost(post)
            .subscribe(
              data => {
                this.appService.isAppLoading = false;
                console.log(JSON.stringify(data));
                if(data.result){  //성공
                  this.appService.newspeedPosts = []; //초기화
                  this.snackBar.open("게시글 업로드 완료", "확인", {
                    duration: 2000,
                  });
                  this.router.navigate(['/']);
                } else {  //실패
                  this.snackBar.open("게시글 업로드 실패 - " + data.message, "확인", {
                    duration: 5000,
                  });
                }
              },
              error => {
                this.appService.isAppLoading = false;
                console.error("[error] - " + error.error.text);
                alert("[error] - " + error.error.text);
              }
            );
          } else {  //벨리데이션 실패
            this.appService.isAppLoading = false;
            this.snackBar.open("본문을 작성하시오.", "확인", {
              duration: 2000,
            });
          }
          
          break;
        }
        case 'map':{ //맛집
          if(this.editorContent.valid && this.titleFormControl.valid && this.marker){
            post.postClassify = 30;
            post.title = this.titleFormControl.value; //제목입력
            this.marker.label = this.titleFormControl.value;
            post.body = this.editorContent.value; //본문입력
            post.images = this.imageArr;
            post.marker = this.marker;
            post.tag = [this.selectType];
            this.httpService.postPost(post)
            .subscribe(
              data => {
                this.appService.isAppLoading = false;
                console.log(JSON.stringify(data));
                if(data.result){  //성공
                  this.appService.newspeedPosts = []; //초기화
                  this.snackBar.open("맛집 업로드 완료", "확인", {
                    duration: 2000,
                  });
                  this.router.navigate(['/']);
                } else {  //실패
                  this.snackBar.open("맛집 업로드 실패 - " + data.message, "확인", {
                    duration: 5000,
                  });
                }
              },
              error => {
                this.appService.isAppLoading = false;
                console.error("[error] - " + error.error.text);
                alert("[error] - " + error.error.text);
              }
            );
          } else {  //벨리데이션 실패
            this.appService.isAppLoading = false;
            this.snackBar.open("본문을 작성하시오.", "확인", {
              duration: 2000,
            });
          }
          break;
        }
        default:{
          console.error('알 수 없음');
          this.snackBar.open("알 수 없음", "확인", {
            duration: 2000,
          });
          break;
        }
      }  
  }

  pressDeleteImage(index:number){
    this.imageArr.splice(index, 1); //삭제
  }

  pressDetailmage(index:number){
    var image = new Image();
    image.src = this.imageArr[index];
    image.onload = () => {
      let dialogRef = this.dialog.open(ShowDetailImageDialog, {
        height: image.height.toString(),
        width: image.width.toString(),
        maxHeight: '100vmin',
        data: { imageUrl: image.src }
      });

      dialogRef.afterClosed().subscribe(result => {});
    } 
  }

  /**
   * 에디터 관련 메서드
   */
  onEditorCreated(quill) {
    this.quillInstance = quill;
    var toolbar = this.quillInstance.getModule('toolbar');
    toolbar.addHandler('image', () => {
      this.fileInputEl.nativeElement.click();
    });

    let elements = this.ElementRef.nativeElement.querySelectorAll('.ql-toolbar');
    var span = document.createElement('span');
    span.className = "ql-formats";
    var emoBtn = document.createElement('button');
    emoBtn.type = "button";
    emoBtn.className = "ql-emoticon";
    // emoBtn.style.backgroundColor = "black";
    emoBtn.addEventListener
    span.appendChild(emoBtn);
    elements[0].appendChild(span);

    emoBtn.addEventListener('click', () => {
      console.log('OQ emoticon select!!');
      this.openEmoticonDialog();
    });
  }

  addImageAndUploadServer($event) {
  
    switch(this.classify){
      case 'post':{ //게시글
        //서버에 이미지 저장 후, url 리턴해서 이미지 뿌려주기=============================
        this.appService.isAppLoading = true;
        this.httpService.uploadImage('board', $event.target.files[0])
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
                  var range = this.quillInstance.getSelection(!this.quillInstance.hasFocus()); 
                  this.quillInstance.insertEmbed(range, 'image', fileUrl);
                  this.snackBar.open("게시글 업로드 완료", "확인", {
                    duration: 2000,
                  });
                } else {
                  throw new Error('이미지 형식이 이상합니다.');
                }
            } else {  //실패
              this.snackBar.open("게시글 업로드 실패 - " + data.message, "확인", {
                duration: 5000,
              });
            }
            this.appService.isAppLoading = false;
          },
          error => {
            this.appService.isAppLoading = false;
            console.error("[error] - " + error.error.text);
            alert("[error] - " + error.error.text);
          }
        );
        //======================================================================
        break;
      }
      case 'elbum':{ //앨범
        //서버에 이미지 저장 후, url 리턴해서 이미지 뿌려주기=============================
        this.uploadImages($event.target.files, 0);
        //======================================================================
        break;
      }
      case 'map':{ //맛집
        this.uploadImages($event.target.files, 0);
        break;
      }
      default:{
        console.error('알 수 없는 이미지 업로드');
        break;
      }
    }  
  }

  uploadImages(imageArr:File[], sequence:number){
    this.appService.isAppLoading = true;
    let classfiyUpload: string;
    switch(this.classify){
      case 'post':{ //게시글
        classfiyUpload = 'board';
        break;
      }
      case 'elbum':{ //앨범
        classfiyUpload = 'elbum';
        break;
      }
      case 'map':{ //맛집
        classfiyUpload = 'food';
        break;
      }
      default: {
        classfiyUpload = 'elbum';
        break;
      }
    };

    this.httpService.uploadImage(classfiyUpload, imageArr[sequence])
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
                  this.imageArr.push(fileUrl);
                } else {
                  throw new Error('이미지 형식이 이상합니다.');
                }
                
                if(imageArr.length > sequence + 1){
                  this.snackBar.open(`이미지 업로드 중... [${sequence + 1}/${imageArr.length}]`, "확인");
                  // setTimeout(() => this.uploadImages(imageArr, sequence + 1), 2000);
                  this.uploadImages(imageArr, sequence + 1);
                  
                }else{
                  this.snackBar.open(`이미지 업로드 완료[${imageArr.length}]`, "확인");
                  this.appService.isAppLoading = false;
                }
          
              } else {  //실패
                console.error("이미지 업로드 실패 - " + data.message);
                alert("이미지 업로드 실패 - " + data.message);
                this.appService.isAppLoading = false;
              }
            },
            error => {
              console.error("이미지 업로드 실패 - " + error.message);
              alert(`이미지 업로드 실패[${sequence + 1}/${imageArr.length}] - ` + error.message);
              this.appService.isAppLoading = false;
            }
          );
  }

  mapClicked($event){
    this.marker = {
      lat: $event.coords.lat,
		  lng: $event.coords.lng,
		  label: this.titleFormControl.value?this.titleFormControl.value:"위치"
    }
  }

  openEmoticonDialog(){
    const dialogRef = this.dialog.open(AppEmoticonDialog, {
      height: this.appService.isPhone?"95%":"80%",
      width: this.appService.isPhone?"95%":"50%"
    });

    dialogRef.afterClosed().subscribe(result => {
      if(result){
        console.log("Dialog result: ${result}");
        let range = this.quillInstance.getSelection(!this.quillInstance.hasFocus()); 
        this.quillInstance.insertEmbed(range, 'image', result);
      }
    });
  }

  /**
   * Cordova Plugin
   */
  cordovaLocationService(){
    new Promise((resolve, reject) => {
      navigator.geolocation.getCurrentPosition(function(position){
        // console.log(JSON.stringify(position));
        resolve(position);
        
      });
    }).then((position:Position) => {
      this.marker = {
        lat: position.coords.latitude,
        lng: position.coords.longitude,
        label: this.titleFormControl.value?this.titleFormControl.value:"위치"
      }

      if (this.map)
        this.map.setCenter({ lat: position.coords.latitude, lng: position.coords.longitude });
    });
  }
}
