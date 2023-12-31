import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { WishlistModule } from './wishlist/wishlist.module';
import { AuthModule } from './auth/auth.module';
import { MissionModule } from './mission/mission.module';
import { TypeOrmModule } from '@nestjs/typeorm';
import { typeORMConfig } from './configs/typeorm.config';
import { BoardModule } from './board/board.module';
import { EventModule } from './event/event.module';
import { VideoChatModule } from './video-chat/video-chat.module';
import { PushModule } from './push/push.module';
// import { CacheService } from './cache/cache.service';
// import { CacheModule } from './cache/cache.module';
import { RedisModule } from './redis/redis.module';
import { ScheduleModule } from '@nestjs/schedule';

@Module({
  imports: [
    TypeOrmModule.forRoot(typeORMConfig),
    AuthModule, 
    WishlistModule, 
    MissionModule,
    BoardModule,
    EventModule,
    VideoChatModule,
    PushModule,
    RedisModule,
    ScheduleModule.forRoot()
  ],

  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}

