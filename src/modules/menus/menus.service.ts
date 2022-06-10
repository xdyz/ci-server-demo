import { HttpException, HttpStatus, Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { MenusEntity } from 'src/entities';
import { Repository } from 'typeorm';
import { CreateMenuDto, UpdateMenuDto } from './dtos/index.dto';

@Injectable()
export class MenusService {
  @InjectRepository(MenusEntity)
  private readonly menusRepository: Repository<MenusEntity>;

  async getOneMenuById(id) {
    // const [ menus ] = await app.mysql.query(menusConstants.SELECT_MENUS_BY_ID, [ id ]);
    const menu = await this.menusRepository.findOne(id);

    return menu;
  }

  async getAllMenus() {
    // const [ menus ] = await app.mysql.query(menusConstants.SELECT_MENUS_NO_CONDITION);
    const menus = await this.menusRepository.find();

    return menus;
  }

  async insertMenu(createMenuDto) {
    try {
      const menu = await this.menusRepository.create(createMenuDto);
      const result = await this.menusRepository.save(menu);

      return result;
    } catch (error) {
      throw new HttpException(error, HttpStatus.INTERNAL_SERVER_ERROR);
    }
  }

  async updateMenu(id, updateMenuDto: UpdateMenuDto) {
    try {
      const result = await this.menusRepository.save({
        id,
        ...updateMenuDto,
      });
      const data = await this.getOneMenuById(result.id);
      return data;
    } catch (error) {
      throw new HttpException(error, HttpStatus.INTERNAL_SERVER_ERROR);
    }
  }

  async delMenu(id) {
    try {
      await this.menusRepository.delete(id);
      return {};
    } catch (error) {
      throw new HttpException(error, HttpStatus.INTERNAL_SERVER_ERROR);
    }
  }
}
