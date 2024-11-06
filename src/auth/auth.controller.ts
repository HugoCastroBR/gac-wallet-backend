import {
  Post,
  Controller,
  Req,
  Res,
  Body,
  Param,
  Patch,
  UseGuards,
  Get,
  Delete,
} from '@nestjs/common';
import { AuthService } from './auth.service';
import { LoginUserDto } from './dto/login-user.dto';
import { Request, Response } from 'express';
import { ApiBearerAuth, ApiTags } from '@nestjs/swagger';
import { RegisterUserDto } from './dto/register-user.dto';
import { UpdateUserDto } from './dto/update-user.dto';
import { JwtAuthGuard } from './auth.guard';

@ApiTags('auth')
@Controller('auth')
export class AuthController {
  constructor(private readonly authService: AuthService) {}

  @Post('login')
  async login(
    @Res() response: Response,
    @Body() loginUserDto: LoginUserDto,
  ): Promise<any> {
    try {
      const result = await this.authService.login(loginUserDto);
      return response.status(200).json({
        message: 'User logged in successfully',
        data: result,
      });
    } catch (error) {
      response.status(400).json({ error: error.message });
    }
  }

  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @Get('me')
  async profile(
    @Res() response: Response,
    @Req() request: Request,
  ): Promise<any> {
    try {
      const token = request.headers.authorization.split(' ')[1];
      const result = await this.authService.getUserByToken(token);
      return response.status(200).json({
        message: 'User profile fetched successfully',
        data: result,
      });
    } catch (error) {
      response.status(400).json({ error: error.message });
    }
  }

  @Post('Register')
  async register(
    @Res() response: Response,
    @Body() registerUserDto: RegisterUserDto,
  ): Promise<any> {
    try {
      const result = await this.authService.register(registerUserDto);
      return response.status(200).json({
        message: 'User registered successfully',
        data: result,
      });
    } catch (error) {
      response.status(400).json({ error: error.message });
    }
  }

  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @Patch('update/:id')
  async updateUser(
    @Req() request: Request,
    @Res() response: Response,
    @Body() updateUserDto: UpdateUserDto,
    @Param('id') id: string,
  ): Promise<any> {
    try {
      const result = await this.authService.updateUser(+id, updateUserDto);
      return response.status(200).json({
        message: 'User updated successfully',
        data: result,
      });
    } catch (error) {
      response.status(400).json({ error: error.message });
    }
  }

  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @Delete('me')
  async deleteUser(
    @Res() response: Response,
    @Req() request: Request,
  ): Promise<any> {
    try {
      const token = request.headers.authorization.split(' ')[1];
      const result = await this.authService.deleteUser(token);
      return response.status(200).json({
        message: 'User deleted successfully',
        data: result,
      });
    } catch (error) {
      response.status(400).json({ error: error.message });
    }
  }
}
