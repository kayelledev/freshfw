class ProductsController < ApplicationController
  def index
      @products = Shoppe::Product.root.ordered.includes(:product_category, :variants)
      @products = @products.group_by(&:product_category)
    end

    def show
      @product = Shoppe::Product.find_by_permalink(params[:permalink])
    end
    
    def buy
      @paramlink = params[:permalink]; #this needs to be the product permalink, not variant permalink 
      puts "product controller - buy: "
      
      puts "#{@paramlink}"
      
      @t_sku =  params[:varsku]
      if @t_sku == nil 
        @product = Shoppe::Product.find_by_sku!(params[:sku])
      else 
        puts @t_sku
        @product = Shoppe::Product.find_by_sku!(params[:varsku])
      end 
      
      current_order.order_items.add_item(@product, 1)
      
      redirect_to product_path(params[:permalink]), :notice => "Product has been added successfuly!"
    end
end
