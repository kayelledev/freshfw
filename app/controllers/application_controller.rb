class ApplicationController < ActionController::Base
  # Prevent CSRF attacks by raising an exception.
  # For APIs, you may want to use :null_session instead.
  protect_from_forgery with: :exception
  before_action :configure_permitted_parameters, if: :devise_controller?
  before_action :set_user_currency, unless: :location_in_cookies? 
  
  rescue_from CanCan::AccessDenied do |exception|
    flash[:alert] = "Access denied. You are not authorized to access the requested page."
    redirect_to root_path  
  end

  protected

    def self.permission
      return name = self.name.gsub('Controller','').singularize.constantize.name rescue self.name.constantize.name
    end

  private

    def location_in_cookies?
      cookies[:currency].present?
    end


    def current_order
      @current_order ||= begin
        if has_order?
          if params[:order_tax_rate] == nil
            params[:order_tax_rate] = Shoppe::TaxRate.find_by_province(Rails.application.config.state_code).rate
          end
          @current_order
        else
          @ip_address = request.ip
          order = Shoppe::Order.create(:ip_address => @ip_address)
          session[:order_id] = order.id
          set_tax_rate(@ip_address, order)
          order
        end
      end
    end

    def set_user_currency
      @ip_address = request.ip
      begin
        cookies[:currency] = Geocoder.search(@ip_address).first.country == 'Canada' ? 'ca' : 'us'
      rescue
        cookies[:currency] = 'us'
      end
    end

    def has_order?
      !!(
        session[:order_id] &&
        @current_order = Shoppe::Order.includes(:order_items => :ordered_item).find_by_id(session[:order_id])
      )
    end

    helper_method :current_order, :has_order?

    def set_tax_rate(ip_address, order)
      begin
        @user_city = Geocoder.search(ip_address).first.city
        @user_state = Geocoder.search(ip_address).first.state_code
        @user_country = Geocoder.search(ip_address).first.country
      rescue
        @user_city = 'Toronto'
        @user_state = Rails.application.config.state_code
        @user_country = Rails.application.config.country
      end 
        @db_tax_rate = Shoppe::TaxRate.find_by_province(Rails.application.config.state_code).rate
      #@db_tax_rate = 0.13 #Shoppe::TaxRate.find_by_province(Rails.application.config.state_code).rate


      puts "show the db tax rate for ON: #{@db_tax_rate}"
      @db_country = Shoppe::Country.where(name: @user_country).first

      if @user_country!=nil && @db_country!=nil
        order.update(billing_country: @db_country)
      else
        order.update(billing_country: Shoppe::Country.where(name: Rails.application.config.country).first)
      end

      if @user_state != nil
        order.billing_address4 = @user_state
        begin
          @db_tax_rate = Shoppe::TaxRate.find_by_province(@user_state).first.rate
        rescue

        end
      else
        order.billing_address4 = Rails.application.config.state_code
      end

      params[:order_tax_rate] = @db_tax_rate

    end

  def configure_permitted_parameters
    (devise_parameter_sanitizer.for(:sign_up) << [:first_name, :last_name]).flatten!
  end
end
