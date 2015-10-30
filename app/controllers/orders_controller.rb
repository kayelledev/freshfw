class OrdersController < ApplicationController
  helper_method :current_order, :has_order?
  before_action :authenticate_user!, only: :checkout

  def destroy
    current_order.destroy
    session[:order_id] = nil
    flash[:notice] = "Your cart has been emptied."
    #TODO delete commented code
    #redirect_to root_path, :notice => "Basket emptied successfully."
    redirect_to products_path
  end

  def show
    @order = current_order
    @order.update(currency: cookies[:currency])
    order_tax = 0.0;
    @order.order_items.each do |item|
      item.update(tax_rate: params[:order_tax_rate])
      order_tax += item.tax_amount
    end

    @order.update(tax: order_tax)
  end

  def remove
    @order = current_order
    #TODO don't commit debug tools
    puts "in remove method: order #{@order.order_items.first.id} and params #{params}"
    @item = @order.order_items.find(params[:order_item_id])
    @order.order_items.delete(@item)

    if @order.order_items.empty?
      flash.now[:notice] = "You have no more item in the cart."
    end

    respond_to do |format|
      format.html { redirect_to cart_path }
      format.js { render 'remove.js.erb'}
    end
  end

  def checkout
    @order = current_order
    @order.update(currency: cookies[:currency])
    if request.get?
      #TODO don't commit debug tools
      puts current_order.total

      #TODO don't commit debug tools
      puts "in checkout get or patch request"

      if current_order.total < 0.01
        #TODO don't commit debug tools
        puts "balance is 0"
        flash[:notice] = "You cannot check out an empty order. Add a room to your cart first."
        redirect_to products_url
      end

    end

    #TODO delete commented code
    #@order = Shoppe::Order.find(current_order.id)

    if request.patch?
      #TODO don't commit debug tools
      #create charges
      # binding_pry

      #TODO don't commit debug tools
      puts "delivery address 1 = #{params[:order][:delivery_address1]}"
      puts "order: #{params[:order]}"
      puts "order id: sep delivery? #{@order.separate_delivery_address}"

      @order.separate_delivery_address = params[:order][:separate_delivery_address]
      @order.phone_number = params[:account][:phone]
      @order.email_address = params[:account][:email]

      proceed_params = @order.separate_delivery_address ?
        with_deliver_params : without_deliver_params

      if @order.proceed_to_confirm(proceed_params)
        redirect_to new_charge_path
      else
        flash.now[:notice] = "Some key information is missing. Please try again."
        render :checkout
      end
      logger.debug '========='
      logger.debug @order.email_address
      logger.debug @order.phone_number
    end
  end

  def refresh_items
    @order = current_order
    if params[:delivery_service_id]
      @order.update_attributes(delivery_service_id: params[:delivery_service_id] )
    end
    if params[:item_quantity]
      item_id = params[:item_id]
      item_quantity = params[:item_quantity]
      @item = @order.order_items.find(item_id)
      @item.update_attributes(quantity: item_quantity)
    end

    respond_to do |format|
      format.js
    end
  end

  def check_country
    @order = current_order
    proceed_params = @order.separate_delivery_address ?
        with_deliver_params : without_deliver_params
    @country = Shoppe::Country.find(proceed_params[:billing_country_id])
    current_country = cookies[:currency] == 'us' ? 'Other' : 'Canada'
    order_country = @country.try(:name) == 'Canada' ? 'Canada' : 'Other'    
    country_changed = current_country == order_country
    render json: country_changed.try(:to_json)
  end

  def payment
    @order = current_order
    puts @order.id
    #@order = Shoppe::Order.find(session[:current_order_id])
    if request.post?
      if @order.accept_stripe_token(params[:stripe_token])
        params.merge!(:order => @order)
        puts "after  removed stripe_charge"
        redirect_to checkout_confirmation_path
      else
        puts "payment failed"
        flash.now[:notice] = "Could not exchange Stripe token. Please try again."
      end
    end
  end

  def confirmation
    if request.post?
      puts "------ post in confirmation"
      current_order.confirm!
      session[:order_id] = nil
      redirect_to root_path, :notice => "Order has been placed successfully!"
    end
  end

  def safe_params
    params[:order].permit(
      :first_name, :last_name, :company,
      :billing_address1, :billing_address2, :billing_address3, :billing_address4, :billing_postcode, :billing_country_id,
      :separate_delivery_address,
      :delivery_first_name, :delivery_last_name, :delivery_address1, :delivery_address2, :delivery_address3, :delivery_address4, :delivery_postcode, :delivery_country_id,
      :delivery_price, :delivery_service_id, :delivery_tax_amount,
      :email_address, :phone_number,
      :notes,
      :order_items_attributes => [:ordered_item_id, :ordered_item_type, :quantity, :unit_price, :tax_amount, :id, :weight]
    )
  end

  def without_deliver_params
    params[:order].permit(
      :first_name, :last_name,
      :billing_address1, :billing_address2,
      :billing_address3, :billing_address4,
      :billing_country_id, :billing_postcode,
      :email_address, :phone_number,
      :delivery_service_id
    )
  end

  def with_deliver_params
    params[:order].permit(
      :first_name, :last_name,
      :billing_address1, :billing_address2,
      :billing_address3, :billing_address4,
      :billing_country_id, :billing_postcode,
      :email_address, :phone_number,
      :separate_delivery_address, :delivery_first_name, :delivery_last_name,
      :delivery_address1, :delivery_address2, :delivery_address3,
      :delivery_address4, :delivery_postcode, :delivery_country_id,
      :delivery_service_id
    )
  end

  def delivery_address_params?
    return false unless params[:order][:delivery_address1].try(&:present?)
    return false unless params[:order][:delivery_postcode].try(&:present?)
    return false unless params[:order][:delivery_country_id].try(&:present?)
    true
  end

end
