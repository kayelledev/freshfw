class ChargesController < ApplicationController
  before_filter { params[:id] && @payment = @order.payments.find(params[:id]) }
  load_and_authorize_resource :class => 'ChargesController'

  def helper
    Helper.instance
  end

  class Helper
    include Singleton
    include ActionView::Helpers::NumberHelper
  end
  
  def new
    puts current_order.total
    
    if current_order.total < 0.01
      puts "balance is 0"
      flash[:notice] = "You cannot check out an empty order. Add a room to your basket first."
      redirect_to products_url
    end 
  end

  def create
    # Amount in cents
    @order = current_order
    puts "in charges create controller "
    
    begin
      @amount = helper.number_with_precision(@order.total*100, precision: 0)
      
      if params[:stripeEmail]==nil
        params[:stripeEmail]= current_order.email_address  
      end 
      
      @customer = Stripe::Customer.create(
        :email => params[:stripeEmail],
        :card  => params[:stripeToken]
      )
      currency = cookies[:currency] == 'ca' ? 'cad' : 'usd'
      @charge = Stripe::Charge.create(
        :customer    => @customer.id,
        :amount      => @amount,
        :description => "#{@order.first_name}'s Order",
        :currency    => currency
      )
      
    rescue Stripe::CardError => e
      flash[:error] = e.message
      redirect_to charges_path
    end
    
    begin 
      @payment = Shoppe::Payment.new(:amount => @order.total, :order_id => @order.id, :method =>'Stripe CC', :reference => @charge.id)
      @payment.save 
    rescue
      flash[:error] = "Something went wrong with the payment transaction. Please check all information and try again. If the error persists, contact us to have it resolved."
      redirect_to charges_path
    end
  end 
    
end
