import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { WishlistRepository } from './wishlist.repository';
import { Wishlist } from './wishlist.entity';
import { NotFoundException } from '@nestjs/common';
import { GivenStatus, PickedStatus } from './wishlist-status';

@Injectable()
export class WishlistService {
    constructor(
        @InjectRepository(WishlistRepository)
        private wishlistRepository: WishlistRepository,
    ) { }

    async getWishlistByUserId(user_id: number): Promise<Wishlist[]> {
        const query = this.wishlistRepository.createQueryBuilder('wishlist');
        query.where('wishlist.user_id = :user_id', { user_id });

        if (!query) {
            throw new NotFoundException(`Wishlist with user ID "${user_id}" not found`);
        }
        const wishlists = await query.getMany();
        return wishlists;
    }

    async getWishlistById(id: number): Promise<Wishlist> {
        const found = await this.wishlistRepository.findOneBy({id});

        if (!found) {
            throw new NotFoundException(`Wishlist with ID "${id}" not found`);
        }

        return found;
    }


    createWishlist(createWishlistDto): Promise<{ code: number; success: boolean; data: { item: Wishlist } }> {
        return this.wishlistRepository.createWishlist(createWishlistDto);
    }

    async deleteWishlist(id: number): Promise<{ code: number; success: boolean }> {
        const result = await this.wishlistRepository.delete(id);

        if (result.affected === 0) {
            throw new NotFoundException(`Can't find board with id ${id}`);
          }

        console.log(`Wishlist with ID "${id}" deleted`);

        return {code: 200, success: true}
    }

    async updateWishlistPickStatus(id: number, pickStatus: PickedStatus): Promise<{ code: number; success: boolean; data: { item: Wishlist } }> {
        const wishlist = await this.getWishlistById(id);
        wishlist.Picked = pickStatus;
        
        await this.wishlistRepository.save(wishlist);
        const response = {
            code: 200,
            success: true,
            data: {
              item: wishlist,
            },
          };
          return response;
    }

    async updateWishlistGivenStatus(id: number, givenStatus: GivenStatus): Promise<{ code: number; success: boolean; data: { item: Wishlist } }> {
        const wishlist = await this.getWishlistById(id);
        console.log(givenStatus);
        console.log(id);
        wishlist.Given = givenStatus;
        
        await this.wishlistRepository.save(wishlist);
        const response = {
            code: 200,
            success: true,
            data: {
              item: wishlist,
            },
          };
          return response;

    }

    async updateWishlist(Wishlistid: number, createWishlistDto): Promise<{ code: number; success: boolean; data: { item: Wishlist } }> {
        const wishlist = await this.getWishlistById(Wishlistid);
        wishlist.ProductName = createWishlistDto.ProductName;
        wishlist.ProductLink = createWishlistDto.ProductLink;
      
        await this.wishlistRepository.save(wishlist);
        
        const response = {
          code: 200,
          success: true,
          data: {
            item: wishlist,
          },
        };
        return response;
      }

}
