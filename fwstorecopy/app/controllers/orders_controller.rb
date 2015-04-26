class OrdersController < ApplicationController
  helper_method :current_order, :has_order?
  
  def destroy
    current_order.destroy
    session[:order_id] = nil
    #redirect_to root_path, :notice => "Basket emptied successfully."
    redirect_to products_path
  end
  
  def checkout
    puts "order id"
    @order = current_order
    
  #@order = Shoppe::Order.find(current_order.id)
    
    if request.patch?
      #create charges 
      
      if @order.proceed_to_confirm(params[:order].permit(:first_name, :last_name, :billing_address1, :billing_address2, :billing_address3, :billing_address4, :billing_country_id, :billing_postcode, :email_address, :phone_number))
        #redirect_to checkout_payment_path
        redirect_to new_charge_path
        
      else
        flash.now[:notice] = "Could not exchange Stripe token. Please try again."
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
  
end
