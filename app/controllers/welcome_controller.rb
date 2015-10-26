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
    render json: {status: true}
  end

end
