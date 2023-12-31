import { Inject, Injectable, NotFoundException, UnauthorizedException } from '@nestjs/common';
import { UserRepository } from './user.repository';
import { InjectRepository } from '@nestjs/typeorm';
import { AuthCredentialsDto } from './dto/auth-credential.dto';
import * as bcrypt from 'bcryptjs';
import { AuthSignInDto } from './dto/auth-signin.dto';
import { JwtService } from '@nestjs/jwt';
import { User } from './user.entity';
import { UserType } from './user-type.enum';
import { v4 as uuidv4 } from 'uuid';
import { ForbiddenException } from '@nestjs/common';
import { PushService } from 'src/push/push.service';
import { PushDto } from 'src/push/dto/push.dto';
import { Cache } from 'cache-manager';
import { CACHE_MANAGER } from '@nestjs/cache-manager';

@Injectable()
export class AuthService {
    
    constructor(
        @InjectRepository(UserRepository)
        private userRepository: UserRepository,
        private jwtService: JwtService,
        private pushService: PushService,
        @Inject(CACHE_MANAGER) private readonly cacheManager: Cache,
    ) {}

    async signUp(authCredentialsDto: AuthCredentialsDto): Promise<void> {
        return this.userRepository.createUser(authCredentialsDto);
    }

    //id(number) 값 입력 받으면 user를 return하는 함수
    async getUserById(id: number): Promise<User> {
        const user = await this.userRepository.findOneBy({id});
    
        if (!user) {
            throw new ForbiddenException('User not found');
        }
    
        return user;
    }

    async siginIn(authSignInDto: AuthSignInDto, pushDto: PushDto):Promise<{accessToken: string, type:string, id:number, user_name:string}> {
        const { user_id, password } = authSignInDto;
        const user = await this.userRepository.findOneBy({ user_id });

        if (user && (await bcrypt.compare(password, user.password))) {
            // 유저 토큰 생성 (Secret + Payload)
            const payload = { user_id };
            const accessToken = await this.jwtService.sign(payload);

            await this.pushService.savePushToken(user.id, pushDto);
            
            return { accessToken, type: user.type, id: user.id, user_name: user.user_name };
        } else {
            throw new UnauthorizedException('login faild');
        }
    }

    async getConnectionCode(user : User): Promise<any> {
        const randomCode = this.getRandomCode();
        // const user = await this.userRepository.findOneBy({ user_id });

        // if (user.code !== null) { 
        //     throw new UnauthorizedException('Already connected');
        // }

        if (!user) {
            throw new NotFoundException('User not found');
        }

        if (user.type !== 'PARENT') {
            return {
                code: 400,
                success: false,
                message: 'Connection Failed',
            };
        }

        await this.cacheManager.set(randomCode, user.user_id, {ttl: 180});
        // user.code = randomCode;
        // await user.save();

        const response = {
            code: 200,
            success: true,
            data: {
                connection_code: randomCode,
            },
        };

        return response;
    }

    // connected true false만 반환하는 코드
    // async updateChildCode(child_id: string, connection_code: string): Promise<void> {
    //     const child = await this.userRepository.findOneBy({ user_id: child_id });
    
    //     if (child) {
    //       child.code = connection_code;
    //       await this.userRepository.save(child);
    //     }
    //   }

    async updateChildCode(child_id: string, connection_code: string): Promise<{ connected: boolean; type: UserType }> {
        const child = await this.userRepository.findOneBy({ user_id: child_id });
        //const parent = await this.userRepository.findOne( { where: { code: connection_code, type: UserType.PARENT } });
        const parent_id = await this.cacheManager.get(connection_code);

        if (parent_id) {
            // child.code = connection_code;
            // await this.userRepository.save(child);
            // 변동 사항 : uuid를 저장하는 것으로 수정
            const parent = await this.userRepository.findOneBy({ user_id: parent_id as string});
            // console.log(parent);
            // console.log(parent_id);

            if (!parent || parent.type !== UserType.PARENT) {
                throw new NotFoundException('Parent not found');
            }

            const uuid = uuidv4();
            
            child.code = uuid;
            parent.code = child.code;

            await this.userRepository.save(child);
            await this.userRepository.save(parent);

            // 레디스에서 해당 임시 코드 삭제
            await this.cacheManager.del(connection_code);

            return { connected: true, type: UserType.PARENT };
        } else {
            
            return { connected: false, type: UserType.CHILD };
        }
    
        // if (child && child.type === UserType.CHILD && parent) {
        //   child.code = connection_code;
        //   await this.userRepository.save(child);
        //   return { connected: true, type: child.type };
        // } else {
        //   return { connected: false, type: null };
        // }
      }

    async getConnectedUser(user: User): Promise<any> {
        const { code, type } = user;
        const userType: UserType = type as UserType;
        const connectedUser = await this.userRepository.findOneByCodeAndDifferentType(code, userType);

        if (!connectedUser) {
            return null;
        }
        
        return connectedUser.id;

    
    


        // if (connectedUser) {
        //     //return connectedUser;
        //     return {
        //         code: 200,
        //         success: true,
        //         data: {
        //           connected_user: connectedUser.user_id,
        //         },
        //       };
        //     } else {
        //       throw new NotFoundException('Connected user not found');
        //     }
          }

    async getConnectedUser_id(user: User): Promise<any> {
        const { code, type } = user;
        const userType: UserType = type as UserType;
        const connectedUser = await this.userRepository.findOneByCodeAndDifferentType(code, userType);

        if (!connectedUser) {
            return null;
        }

        return connectedUser.user_id;
        }

    async getConnectedUserPuhsToken(user: User): Promise<any> {
        const { code, type } = user;
        const userType: UserType = type as UserType;
        const connectedUser = await this.userRepository.findOneByCodeAndDifferentType(code, userType);

        if (!connectedUser) {
            return null;
        }
        
        return connectedUser.push_connection;    
    }


    private getRandomCode(): string {
        const characters = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
        let code = '';
        for (let i = 0; i < 4; i++) {
            code += characters.charAt(Math.floor(Math.random() * characters.length));
        }
        return code;
    }

    // user_id를 넣으면 user의 type을 return하는 함수
    async getUserTypeToUserId(user_id: string): Promise<UserType | null> {
        const user = await this.userRepository.findOneBy( { user_id });

        if (user) {
            return user.type as UserType;
        }
        return null;
    }
}