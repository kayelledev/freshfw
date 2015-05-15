module OrdersHelper

  def current_system order, service
    order.delivery_service == service
  end

end
