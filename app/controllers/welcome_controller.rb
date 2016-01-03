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
      @orders = Shoppe::Order.where(email_address: current_user.email_address).order('updated_at DESC')
      @products = current_user.reviews.order('updated_at DESC').take(3).map{|review| Shoppe::Product.find(review.product_id) }
      @current_user = current_user
    end

  end

  
  def change_user_country
    cookies[:currency] = params[:currency] if params[:currency].present?
    @order = current_order
    @order.update(currency: cookies[:currency])
    render json: {status: true}
  end

end
