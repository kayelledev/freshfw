class ProductsController < ApplicationController
  include ProductsHelper
  before_action :find_product, except: [:index]

  def index
    @products = Shoppe::Product.root.ordered.includes(:product_category, :variants)
    @products = @products.group_by(&:product_category)
  end

  def show
  end

  def buy
    current_order.order_items.add_item(@product, 1)
    redirect_to product_path(id: root_product.permalink), :notice => "Product has been added successfuly! #{link_to 'View Your Cart', cart_path}" 
  end

  private

  def find_product
    @product = Shoppe::Product.find_by_permalink(params[:id])
  end

end
