class ApplicationController < ActionController::Base
  # Prevent CSRF attacks by raising an exception.
  # For APIs, you may want to use :null_session instead.
  protect_from_forgery with: :exception
  
  private

    def current_order
      @current_order ||= begin
        if has_order?
          @current_order
        else
          @ip_address = request.ip
          order = Shoppe::Order.create(:ip_address => @ip_address) 
          session[:order_id] = order.id
          
          puts "application contoller: ip address: #{@ip_address} params: #{params} and geo: #{Geocoder.search(@ip_address).first.state}"
          @user_city = Geocoder.search(@ip_address).first.city
          @user_state = Geocoder.search(@ip_address).first.state_code
          @user_country = Geocoder.search(@ip_address).first.country
    
          @db_tax_rate = Shoppe::TaxRate.find_by_province(Rails.application.config.state_code).rate
   
          puts "show the db tax rate for ON: #{@db_tax_rate}"
          @db_country = Shoppe::Country.where(name: @user_country).first
    
          if @user_country!=nil && @db_country!=nil
            @order.billing_country = @db_country
          else
            @order.billing_country = Shoppe::Country.where(name: Rails.application.config.country).first
          end
    
          if @user_state != nil      
            @order.billing_address4 = @user_state
            begin
              @db_tax_rate = Shoppe::TaxRate.find_by_province(@user_state).first.rate
            rescue
        
            end 
          else
            @order.billing_address4 = Rails.application.config.province
          end
    
          params[:order_tax_rate] = @db_tax_rate
          puts "@db_tax_rate is now in params #{params}"
          puts "In application controler/ current order: IP: #{@ip_address}, state: #{@user_state}, country: #{@user_country}"
          
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
  
end
