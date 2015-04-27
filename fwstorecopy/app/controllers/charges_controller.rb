class ChargesController < ApplicationController
  before_filter { params[:id] && @payment = @order.payments.find(params[:id]) }

  def helper
    Helper.instance
  end

  class Helper
    include Singleton
    include ActionView::Helpers::NumberHelper
  end
  
  def new
  end

  def create
    # Amount in cents
    @order = current_order
    puts "in charges create controller "
    puts @order.id 
    
    @amount = helper.number_with_precision(@order.total*100, precision: 0)
    @customer = Stripe::Customer.create(
      :email => params[:stripeEmail],
      :card  => params[:stripeToken]
    )
    
    @charge = Stripe::Charge.create(
      :customer    => @customer.id,
      :amount      => @amount,
      :description => @order.first_name,
      :currency    => 'cad'
    )
  
    @payment = Shoppe::Payment.new(:amount => @order.total, :order_id => @order.id, :method =>'Stripe CC', :reference => @charge.id)
    @payment.save 
    puts "Charges Controler - create - after merging payment into order" 
    
    rescue Stripe::CardError => e
      flash[:error] = e.message
  
      @order.reject!
      redirect_to charges_path
    end
    
end
