# <img src= "https://github.com/po-do/Poki/assets/59272854/16bfc906-8f7e-43c3-910b-99213139dcc9"  height="40px" width="40px" style="margin-bottom: -5px"> Poki
### 포키(Poki) - 부모-자녀 소통을 높이는 온라인 플랫폼
<p align="center"><img src= "https://github.com/po-do/Poki/assets/126448936/bb1aaa88-d053-4487-86e1-2c812b7c0db1"  height="25%" width="25%"></p>

- **Poki**는 맞벌이 가정의 부모님과 아이들을 위한 상호작용 서비스입니다.  
- 부모님은 멀리 있는 자녀와도 OK! 아이들과 느껴보지 못했던 소중한 경험을 쌓아보세요.

## 📋 프로젝트 포스터
<p align="center"><img src= "https://github.com/po-do/Poki/assets/59272854/9bea9973-579a-4740-8d78-d05d2a82d2d9"  height="50%" width="50%"></p>

[poster.pdf](https://github.com/po-do/Poki/files/11980391/poster.pdf)

## 🧐 How to use
* 로그인 후 자녀와 부모님은 고유 코드로 연결하게 됩니다.
* 자녀는 가지고 싶은 선물을 검색하여 위시리스트에 등록할 수 있습니다.
* 부모님은 자녀가 등록한 위시리스트를 보고 자녀에게 주고 싶은 선물을 선택하게 되고 포도알 모으기를 시작하게 됩니다.
* 부모님은 자녀에게 미션을 줄 수 있습니다.
* 자녀는 미션을 수행하고 포도알을 받게 됩니다.
* 31개의 포도알을 모으게 되면 부모님은 자녀에게 선물을 주게 됩니다.

## 🚀 주요 기능
![image](https://github.com/po-do/Poki/assets/59272854/c172114f-9af3-4c8a-a779-c6908419a633)

### 🚀 포도알 모으기
31개의 포도알을 모아보세요.

![포도알붙히기](https://github.com/po-do/Poki/assets/108652367/a2f74213-2bcb-4a29-b91d-1401b0777e92)


### 🚀 선물 검색
원하는 선물을 선택해 보세요.

![선물검색](https://github.com/po-do/Poki/assets/108652367/efa51a65-2d61-4d96-8fc3-f8baddf52e2d)


### 🚀 AI 미션 추천
AI를 활용하여 미션을 추천받아 보세요.

![AI미션 추천](https://github.com/po-do/Poki/assets/108652367/927acb66-da03-4883-93ae-6a336269b8d7)


### 🚀 미션 예약
미션을 예약해 보세요.

![미션예약](https://github.com/po-do/Poki/assets/108652367/50168ec3-fdc3-4878-aca6-b0482da14a74)


### 🚀 채팅
채팅으로 부모님과 소통해보세요.
### 🚀 화상 통화
부모님과 화상 통화를 해보세요.

![화상통화](https://github.com/po-do/Poki/assets/108652367/949eb612-e4d8-4d31-87c2-47b2b585eee6)


### 🚀 웹-앱
모바일에서 설치하여 웹과 앱에서 모두 사용해보세요.
### 🚀 캘린더
캘린더로 포도알 및 선물을 준 기록을 확인해 보세요.

![캘린더](https://github.com/po-do/Poki/assets/108652367/7c8d2d7f-4f5d-4dd2-8e1a-9d94fd1ab742)


### 🚀 알림
메시지, 화상통화, 미션 등의 알림을 받아보세요.

![알림](https://github.com/po-do/Poki/assets/108652367/f614dcb2-af6d-4b17-a81e-d04df9b6f0d6)


## 📚 프로젝트 진행시 맡은 부분
- Board & Wishlist CRUD 설계

  - 유저간 Board  동기화를 위한 Client-Server  통신 방식 개선

    - 자녀의 Whishlist 중에 선물을 선택, 포도 개수 31개 완료후 선물 증정 -> Board 생성, 삭제 필요

    - 부모가 자녀에게 포도알을 증정하거나, 자녀가 포도알을 붙힐경우 서로의 화면에 정보 동기화 필요

    - 서비스 메인페이지에서는 위의 다수의 이벤트들이 발생, 발생 할 때마다 보드의 정보가 필요

    - 초기 설계시 Poling 방식으로 각각의 이벤트가 전부 Board 의 상태를 요청 -> 서버 과부화 발생

    - 처음 메인 페이지에서 클라이언트가 서버에 Board의 상태를 요청후 대기, 이벤트 발생시 서버 측에서 상태를 응답하는 SSE 방식으로 변경 

      

  - 소스 코드

    - 메인페이지 접속시 클라이언트 측에서  Board 상태 요청 -> 서버 측 처음 Board 상태 응답후 대기

    ```javascript
    let globalVersion = 0; // Global version variable(전역변수 지정)
    @Sse('/grape/sse/user')
        async sseGetBoardByUserId(
          @GetUser() user: User,
          @GetUserId() id: number,
          @GetUserType() type: string,
        ): Promise<Observable<responseSseBoardDto>> {
      
          if (type !== 'PARENT') {
            id = await this.AuthService.getConnectedUser(user);
          }
          const use_grape = await this.boardService.getBoardByUserId(id);
          return new Observable<responseSseBoardDto>((observer) => {
            let localVersion = 0; // Local version variable
            const initialData = async () => {
                // 맨 처음 보드 상태를 불러옴(Board 존재하지 않을 경우)          
                if (!use_grape) {
                    const initialResponse: responseSseBoardDto = {
                        data: {
                            code: 200,
                            success: true,
                            grape: {
                                id:0,
                                blank: 0,
                                total_grapes: 0,
                                attached_grapes: 0,
                                deattached_grapes: 0,
                            },
                            is_existence: false,
                        },
                    };
                    observer.next(initialResponse);
                    localVersion = globalVersion;
                  // Update the local version
                    return;
                }
              // 맨 처음 보드 상태를 불러옴(Board 존재할 경우)
                const initialResponse: responseSseBoardDto = {
                    data: {
                    code: 200,
                    success: true,
                    grape: await this.boardService.getBoardByUserId(id),
                    is_existence: true,
                    },
                };
                observer.next(initialResponse);
                localVersion = globalVersion;
                // Update the local version
                };
    ```

    - 자녀가 포도알을 붙히거나 여러 이벤트 발생시 서버측에서 Board의 상태 전송

    ```javascript
     //포도 부착 버튼 클릭시 실행 함수
        @Post('/grape/attach')
        async attachBoard(
        ): Promise<responseBoardDto> {
            globalVersion += 1; // 서버에서 이벤트 발생 확인
            return response
        }
    
    ---------------------------------------------------------------------------------------
         
        // 다른 이벤트가 발생했을 경우(대기중인 서버에서 이벤트 발생시 Board 상태 응답)
              if (localVersion < globalVersion) {
                const use_grape = await this.boardService.getBoardByUserId(id);
                // 맨 처음 보드 상태를 불러옴(Wishlist 증정으로 인한 Board 존재하지 않을 경우)
                if (!use_grape) {
                    const response: responseSseBoardDto = {
                        data: {
                            code: 200,
                            success: true,
                            grape: {
                                id:0,
                                blank: 0,
                                total_grapes: 0,
                                attached_grapes: 0,
                                deattached_grapes: 0,
                            },
                            is_existence: false,
                        },
                    };
                    observer.next(response);
                    localVersion = globalVersion; // Update the local version
                    return;
                }
                // 맨 처음 보드 상태를 불러옴(Board 존재할 경우)
                const response: responseSseBoardDto = {
                  data: {
                    code: 200,
                    success: true,
                    grape: await this.boardService.getBoardByUserId(id),
                    is_existence: true,
                  },
                };
                observer.next(response);
                localVersion = globalVersion; // Update the local version
              }
            };
            initialData(); 
            const intervalId = setInterval(updateData, 500);
            // 클라이언트 측에서 연결이 끊어졌을 경우
            observer.complete = () => {
              clearInterval(intervalId);
            };
            
            localVersion = globalVersion;
            return observer;
          });
    
    ```

    - Chat WebSocket 백엔드 부분 설계

  - 채팅 내역 저장

    - 상대방과의 채팅 내역 저장을 위해  eventGateway 측에서 Message 정보 직접 저장
  
      ```javascript
        @SubscribeMessage('message')
          async handleMessage(
              @ConnectedSocket() socket: Socket,
              @MessageBody() { roomName, message, user }: MessagePayload,
          ) {
              // Save message in database
              this.eventService.createMessage(user.user_id, message, roomName, user.id, user.name);
      
              socket.to(roomName).emit('message', { sender_id: user.user_id, message, check_id: user.id, createdAt: new Date(), sender_name: user.name });
      
              return { sender_id: user.user_id, message, check_id: user.id, createdAt: new Date(), sender_name: user.name };
          }
      ```
  
    - 저장된 채팅 내역 채팅 작성된 시간 순으로  리스트 형식으로 클라이언트 측에 응답
  
      ```javascript
          async getMessage(room_name: string): Promise<Message[]> {
              const messages = await this.messageRepository
                .createQueryBuilder('message')
                .where('message.conversation_id = :room_name', { room_name })
                .orderBy('message.createdAt', 'ASC')
                .getMany();
            
              return messages ;
            }
      ```
  
  - 채팅 알림을 위한 채팅방 입장/비입장 표시 구현
  
    - 채팅방에 상대방 없을시 메세지 내용 알림으로 전송하는 기능 구현
  
    - 구현 위에 유저가 채팅 페이지에 입장시 지정된 DB에 저장
  
    - 유저가 채팅 페이지에 나갈 시 DB에서 삭제 
  
      ```javascript
      //유저 채팅방에 입장시
       @SubscribeMessage('setUserName')
          async handleSetUserName(
              @MessageBody() data: { user_id: string },
              @ConnectedSocket() socket: Socket
          ) {
              await this.eventService.createChatSocketConnection(data.user_id, socket.id);
          }
      -----------------------------------------------------------------------------------------------
      // 유저 채팅방 퇴장시
       @SubscribeMessage('disconnect')
          async handleDisconnect(@ConnectedSocket() socket: Socket) {
              try {
                  const disconnectedUser = await
                  this.eventService.findChatConnectionBySocketId(socket.id);
                  if (disconnectedUser) {
                      this.eventService.deleteChatConnection(disconnectedUser)
                  }
              } catch (error) {
                  this.logger.error(error);
              }
      
          }
          
      ```
  
    - DB에 유저 존재 여부에 따른 입장/비입장 표시
  
      ```javascript
      //@SubscribeMessage('message')
      const now_user = await this.authService.getUserById(user.id);
              // 채팅방에 상대방이 있는지 확인
              const connect_userId = await this.authService.getConnectedUser_id(now_user);
      
              const check = await this.eventService.checkChatConnection(connect_userId);
      
              if (!check) {
      
                  try {
      
                      const connect_id = await this.authService.getConnectedUser(now_user);
                      const pushToken = await this.pushService.getPushToeknByUserId(connect_id);
      
                      const title = '새로운 메시지가 도착했습니다.';
                      let info;
      
                      if (!message.startsWith('/static/media')) {
                          info = message;
                      }
                      else {
                          info = '이모티콘을 보냈습니다.'
                      }
                      await this.pushService.push_noti(pushToken, title, info);
                  } catch (exception) {
                      if (exception instanceof ForbiddenException) {
                          return { sender_id: user.user_id, message, check_id: user.id, createdAt: new Date(), sender_name: user.name };
                      }
      
                  }
              }
      ```

    


## 📚 기술스택

| 분류                      | 기술                                                                                                                                                                                                                                                                                                                                                                                                                                           |
| ------------------------- | ---------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| **Frontend**              | <img src="https://img.shields.io/badge/react-61DAFB?style=for-the-badge&logo=react&logoColor=white"> <img src="https://img.shields.io/badge/tailwindcss-38B2AC?style=for-the-badge&logo=tailwind-css&logoColor=white"> <img src="https://img.shields.io/badge/firebase-FFCA28?style=for-the-badge&logo=firebase&logoColor=white"> <img src="https://img.shields.io/badge/pwa-5A0FC8?style=for-the-badge&logo=pwa&logoColor=write"> <img src="https://img.shields.io/badge/recoil-362d59?style=for-the-badge&logo=recoil&logoColor=white">    |
| **Backend**               | <img src="https://img.shields.io/badge/nestjs-E0234E?style=for-the-badge&logo=nestjs&logoColor=white"> <img src="https://img.shields.io/badge/PM2-2B037A?style=for-the-badge&logo=PM2&logoColor=white"> |
| **WebRTC**              | <img src="https://img.shields.io/badge/WebRTC-333333?style=for-the-badge&logo=webRTC&logoColor=white"> <img src="https://img.shields.io/badge/socket.io-010101?style=for-the-badge&logo=socket.io&logoColor=white"> <img src="https://img.shields.io/badge/PeerJS-F1680D?style=for-the-badge&logoColor=white">
| **Database**              | <img src="https://img.shields.io/badge/mysql-4479A1?style=for-the-badge&logo=mysql&logoColor=white"> <img src="https://img.shields.io/badge/redis-DC382D?style=for-the-badge&logo=redis&logoColor=white">                                                                                                                 |
| **Infrastructure/DevOps** |  <img src="https://img.shields.io/badge/aws_Route_53-A100FF?style=for-the-badge&logo=amazonaws&logoColor=white"> <img src="https://img.shields.io/badge/aws_CouldFront-A100FF?style=for-the-badge&logo=amazonaws&logoColor=white"> <img src="https://img.shields.io/badge/aws_alb-A100FF?style=for-the-badge&logo=amazonaws&logoColor=white"> <img src="https://img.shields.io/badge/aws_ACM-E21E29?style=for-the-badge&logo=amazonaws&logoColor=white"> <img src="https://img.shields.io/badge/aws_s3-569A31?style=for-the-badge&logo=amazonaws&logoColor=white"> <img src="https://img.shields.io/badge/githubactions-2088FF?style=for-the-badge&logo=githubactions&logoColor=white">          |

## 🧩 서비스 구조도
![poki-service](https://github.com/po-do/Poki/assets/126448821/eca35817-6d3e-415c-9f70-c6d94043be4e)

## 👨‍👨‍👦‍👦 팀원소개
<table>
  <tbody>
    <tr>
      <td align="center"><img src="https://github.com/po-do/Poki/assets/59272854/2a77b2bd-f7cd-4326-ae27-e2fdc41e0bda"width="150px;" alt=""/><br /><sub><b><a href="https://github.com/jy604">BE 팀장 : 박정영</a></b></sub><br /></td>
      <td align="center"><img src="https://github.com/po-do/Poki/assets/59272854/5d3b0cb7-d147-49d2-8195-7a6ecc229a22" width="150px;" alt=""/><br /><sub><b><a href="https://github.com/suyoung049">BE 팀원 : 이수영</a></b></sub><br /></td>
      <td align="center"><img src="https://github.com/po-do/Poki/assets/59272854/2002e3cf-0f50-4583-ab50-bf5ed219693d" width="150px;" alt=""/><br /><sub><b><a href="https://github.com/Jeon-Yoojin">BE 팀원 : 전유진</a></b></sub><br /></td>
      <td align="center"><img src="https://github.com/po-do/Poki/assets/59272854/7f671376-0e53-4442-9884-5fa1b8f76081" width="150px;" alt=""/><br /><sub><b><a href="https://github.com/jaewon4">FE 팀원 : 김재원</a></b></sub><br /></td>
      <td align="center"><img src="https://github.com/po-do/Poki/assets/59272854/e2671a23-7c87-44d9-9088-19fcd8e4f29b" width="150px;" alt=""/><br /><sub><b><a href="https://github.com/swssue">FE 팀원 : 지수현</a></b></sub><br /></td>
    </tr>
  </tbody>
</table>
