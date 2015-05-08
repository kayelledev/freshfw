class OrdersController < ApplicationController
  helper_method :current_order, :has_order?

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

    item = @order.order_items.find(params[:order_item_id])
    item.destroy

    if @order.order_items.empty?
      flash.now[:notice] = "You have no more item in the cart."
    end

    redirect_to cart_path
  end

  def checkout
    @order = current_order

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

      if delivery_address_params?
        puts "setting separate delivery address to true "
        @order.separate_delivery_address = true
      else
        puts "setting separate delivery address to false "
        @order.separate_delivery_address = false
      end

      if @order.separate_delivery_address

        if @order.proceed_to_confirm(with_deliver_params)
          #redirect_to checkout_payment_path
          puts "no separate delivery address"

          redirect_to new_charge_path

        else
          flash.now[:notice] = "Some key information is missing. Please try again."
        end

      else
        puts "* separate delivery address  #{params}"

        if @order.proceed_to_confirm(without_deliver_params)
          #redirect_to checkout_payment_path
          puts "order controller = checkout / request = patch = getting ready for new charge path "
          redirect_to new_charge_path
        else
          flash.now[:notice] = "Some key information is missing. Please try again."
        end
      end
    end
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
      :delivery_name, :delivery_address1, :delivery_address2, :delivery_address3, :delivery_address4, :delivery_postcode, :delivery_country_id,
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
      :email_address, :phone_number
    )
  end

  def with_deliver_params
    params[:order].permit(
      :first_name, :last_name,
      :billing_address1, :billing_address2,
      :billing_address3, :billing_address4,
      :billing_country_id, :billing_postcode,
      :email_address, :phone_number,
      :separate_delivery_address, :delivery_name,
      :delivery_address1, :delivery_address2, :delivery_address3,
      :delivery_address4, :delivery_postcode, :delivery_country_id,
      :delivery_price, :delivery_service_id, :delivery_tax_amount
    )
  end

  def delivery_address_params?
    return false unless params[:order][:delivery_address1].try(&:present?)
    return false unless params[:order][:delivery_postcode].try(&:present?)
    return false unless params[:order][:delivery_country_id].try(&:present?)
    true
  end
end
