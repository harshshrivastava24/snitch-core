import axiosClient from '../../../api/axiosClient'

export const orderApi = {
  createOrder: async (address) => {
    return await axiosClient.post('/orders', { address })
  },

  getOrders: async () => {
    return await axiosClient.get('/orders')
  },

  cancelOrder: async (orderId) => {
    return await axiosClient.patch(`/orders/cancel/${orderId}`)
  },

  updateOrderStatus: async (orderId, status) => {
    return await axiosClient.patch(`/orders/status/${orderId}`, { status })
  },

  createPaymentOrder: async (address) => {
    return await axiosClient.post('/payment/create-order', { address })
  },

  verifyPayment: async (paymentData) => {
    return await axiosClient.post('/payment/verify', paymentData)
  }
}