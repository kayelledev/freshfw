class WelcomeController < ApplicationController

  def index
  end

  def about_us
  end

  def blog
  end

  def account
  end

  def change_user_country
    cookies[:currency] = params[:currency] if params[:currency].present?
    @order = current_order
    @order.update(currency: cookies[:currency])
    render json: {status: true}
  end

end
