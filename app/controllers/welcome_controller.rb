class WelcomeController < ApplicationController
  include ProductsHelper
  include ActionView::Helpers::UrlHelper
# There is no need to add welcome controller to roles system
  # load_and_authorize_resource :class => 'WelcomeController'

  def index
  end

  def about_us
  end

  def blog
  end


  def account
    if current_user.present?
      @orders = Order.where(email_address: current_user.email_address).order('updated_at DESC')
      @products = current_user.reviews.order('updated_at DESC').take(3).map{|review| Product.find(review.product_id) }
      @design_projects = current_user.design_projects 
    end
  end

  def change_user_country
    cookies[:currency] = params[:currency] if params[:currency].present?
    @order = current_order
    @order.update(currency: cookies[:currency])
    render json: {status: true}
  end

  private
  def self.non_restfull_permission
    nil
  end

end
