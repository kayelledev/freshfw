module Shoppe
  class UsersController < Shoppe::ApplicationController

    before_filter { @active_nav = :users }
    before_filter { params[:id] && @user = ::User.find(params[:id]) }
    before_filter(:only => [:create, :update, :destroy]) do
      if Shoppe.settings.demo_mode?
        raise Shoppe::Error, t('shoppe.users.demo_mode_error')
      end
    end

    def index
      @users = ::User.all
    end

    def new
      @user = ::User.new
    end

    def create
      @user = ::User.new(safe_params)
      if @user.save
        redirect_to :users, :flash => {:notice => t('shoppe.users.create_notice') }
      else
        render :action => "new"
      end
    end

    def edit
      @orders = Shoppe::Order.where(email_address: @user.email_address).order('updated_at DESC')
      @products = @user.reviews.last_monthly_data.map{|review| Shoppe::Product.find(review.product_id) }
    end

    def update
      if @user.update(safe_params)
        redirect_to [:edit, @user], :flash => {:notice => t('shoppe.users.update_notice') }
      else
        render :action => "edit"
      end
    end

    def destroy
      raise Shoppe::Error, t('shoppe.users.self_remove_error') if @user == current_user
      @user.destroy
      redirect_to :users, :flash => {:notice => t('shoppe.users.destroy_notice') }
    end

    private

    def safe_params
      params[:user].permit(:first_name, :last_name, :email_address, :password, :password_confirmation, :admin)
    end

  end
end
