import { NextFunction, Request, Response } from 'express'
import mongoose from 'mongoose'

import ordersService from '../services/orders'
import Order, { OrderDocument } from '../model/Order'
import { InternalServerError, NotFoundError } from '../errors/ApiError'
import User from '../model/User'

export async function getAllOrders(_: Request, response: Response, next: NextFunction) {
  try {
    const orders = await ordersService.getAllOrders()
    response.status(200).json(orders)
  } catch (error) {
    next(new InternalServerError())
  }
}

export async function createOrder(request: Request, response: Response, next: NextFunction) {
  try {
    const userId = request.params.userId
    const { products } = request.body

    const newData = new Order({ products })
    const newOrder = await ordersService.createOrder(newData)

    await User.findByIdAndUpdate(userId, { $push: { orders: newOrder } })

    response.status(201).json({ newOrder })
  } catch (error) {
    next(new InternalServerError())
  }
}

export async function getOrder(request: Request, response: Response, next: NextFunction) {
  try {
    const foundOrder = await ordersService.getOrderByUserId(request.params.userId)
    response.status(200).json(foundOrder?.orders)
  } catch (error) {
    if (error instanceof NotFoundError) {
      next(error)
    }

    if (error instanceof mongoose.Error.CastError) {
      response.status(404).json({
        message: 'wrong id format'
      })
      return
    }

    next(new InternalServerError())
  }
}

export async function updateOrder(request: Request, response: Response, next: NextFunction) {
  try {
    const newData = request.body as Partial<OrderDocument>
    const foundOrder = await ordersService.updateOrder(request.params.orderId, newData)
    response.status(200).json(foundOrder)
  } catch (error) {
    if (error instanceof NotFoundError) {
      next(error)
    }

    if (error instanceof mongoose.Error.CastError) {
      response.status(404).json({
        message: 'wrong id format'
      })
      return
    }

    next(new InternalServerError())
  }
}

export async function deleteOrder(request: Request, response: Response, next: NextFunction) {
  try {
    // eslint-disable-next-line no-unused-vars, @typescript-eslint/no-unused-vars
    const foundOrder = await ordersService.deleteOrderById(request.params.orderId)
    response.sendStatus(204)
  } catch (error) {
    if (error instanceof NotFoundError) {
      next(error)
    }

    if (error instanceof mongoose.Error.CastError) {
      response.status(404).json({
        message: 'wrong id format'
      })
      return
    }

    next(new InternalServerError())
  }
}
