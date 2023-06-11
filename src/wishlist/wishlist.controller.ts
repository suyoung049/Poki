import { Body, Controller, Get, Param, Post, Delete, Patch, ValidationPipe, UsePipes, ParseIntPipe, UseGuards, ForbiddenException } from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';
import { WishlistService } from './wishlist.service';
import { CreateWishlistDto } from './dto/create-wishlist.dto';
import { Wishlist } from './wishlist.entity';
import { GivenStatus, PickedStatus } from './wishlist-status';


@Controller('wishlist')
// @UseGuards(AuthGuard())

export class WishlistController {
    constructor(private wishlistService: WishlistService) { }

    @Get('/user/:id')
    getWishlistByUserId(@Param('id', ParseIntPipe) user_id: number): Promise<{ code: number; success: boolean; data: { item: Wishlist[] } }> {
        return this.wishlistService.getWishlistByUserId(user_id);
    }



    @Get('/:id')
    getWishlistById(@Param('id', ParseIntPipe) id: number): Promise<Wishlist> {
        return this.wishlistService.getWishlistById(id);
    }

    @Post('/create')
    @UsePipes(ValidationPipe)
    createWishlist(
        @Body() CreateWishlistDto:CreateWishlistDto,
        // @GetUser() user:User,
    ): Promise<{ code: number; success: boolean; data: { item: Wishlist } }> {
        // if (user.status !== 'child') {
        //     throw new ForbiddenException('Only children can create a wishlist.');
        // }
        return this.wishlistService.createWishlist(CreateWishlistDto);

    }

    @Delete('item/:id')
    deleteWishlist(
        @Param('id', ParseIntPipe) id: number,
        // @GetUser() user: User,
    ): Promise<{ code: number; success: boolean }> {
        // if (user.status !== 'child') {
        //     throw new ForbiddenException('Only children can delete a wishlist.');
        // }
        return this.wishlistService.deleteWishlist(id);
    }

    @Patch('item/:id/pickstatus')
    updateWishlistPickStatus(
        @Param('id', ParseIntPipe) id: number,
        @Body('pickStatus') pickStatus: PickedStatus,
        // @GetUser() user: User,
    ): Promise<{ code: number; success: boolean; data: { item: Wishlist } }> {
        // if (user.status !== 'parent') {
        //     throw new ForbiddenException('Only parents can update a wishlist.');
        // }
        return this.wishlistService.updateWishlistPickStatus(id, pickStatus);
    }

    @Patch('item/:id/givenstatus')
    updateWishlistGivenStatus(
        @Param('id', ParseIntPipe) id: number,
        @Body('givenStatus') givenStatus: GivenStatus,
        // @GetUser() user: User,
    ): Promise<{ code: number; success: boolean; data: { item: Wishlist } }> {
        // if (user.status !== 'parent') {
        //     throw new ForbiddenException('Only parents can update a wishlist.');
        // }
        return this.wishlistService.updateWishlistGivenStatus(id, givenStatus);
    }

    @Patch('item/:id')
    updateWishlist(
        @Param('id', ParseIntPipe) Wishlistid: number,
        @Body() CreateWishlistDto:CreateWishlistDto,
        // @GetUser() user: User,
    ): Promise<{ code: number; success: boolean; data: { item: Wishlist } }> {
        // if (user.status !== 'child') {
        //     throw new ForbiddenException('Only children can update a wishlist.');
        // }

        // if (user.id !== Wishlistid.user.id) {
        //     throw new ForbiddenException('You can only update your own wishlist.');
        // } 
        return this.wishlistService.updateWishlist(Wishlistid, CreateWishlistDto);
    }

}

