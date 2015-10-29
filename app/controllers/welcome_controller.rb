class WelcomeController < ApplicationController
  include ProductsHelper
  include ActionView::Helpers::UrlHelper

  def index
  end

  def about_us
  end

  def blog
  end

  def account
    if current_user.present?
      @orders = Shoppe::Order.where(email_address: current_user.email_address)
      @products = current_user.products.order('created_at DESC').take(3).map{|product| Shoppe::Product.find(product) }
    end
  end

  def change_user_country
    cookies[:currency] = params[:currency] if params[:currency].present?
    @order = current_order
    @order.update(currency: cookies[:currency])
    render json: {status: true}
  end

end
