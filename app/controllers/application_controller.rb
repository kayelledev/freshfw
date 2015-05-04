class ApplicationController < ActionController::Base
  # Prevent CSRF attacks by raising an exception.
  # For APIs, you may want to use :null_session instead.
  protect_from_forgery with: :exception
  
  private

    def current_order
      @current_order ||= begin
        if has_order?
          if params[:order_tax_rate]==nil
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
        @user_state = Rails.application.config.province
        @user_country = Rails.application.config.country
      end 
      @db_tax_rate = Shoppe::TaxRate.find_by_province(Rails.application.config.state_code).rate

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
        order.billing_address4 = Rails.application.config.province
      end

      params[:order_tax_rate] = @db_tax_rate
      
    end
end
