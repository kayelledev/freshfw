class ProductsController < ApplicationController
  include ProductsHelper
  include ActionView::Helpers::UrlHelper

  before_action :find_product, except: [:index]

  def index
    @products = Shoppe::Product.root.ordered.includes(:product_category, :variants)
    @products = @products.group_by(&:product_category)
  end

  def show
    @items = Shoppe::Product.all
    @categories = Shoppe::ProductCategory.all
  end

  def buy
    current_order.order_items.add_item(@product, 1)
    redirect_to product_path(id: root_product.permalink), :notice => "Product has been added successfuly! #{link_to 'View Your Cart', cart_path}"
  end

  def destroy_img
    product = Shoppe::Product.find(params[:id])
    product.update(params[:img_id].to_sym => nil)
    product.update("url_#{params[:img_id]}".to_sym => nil)
    case params[:img_id]
    when 'image2'
      product.remove_image2!
    when 'image3'
      product.remove_image3!
    when 'image4'
      product.remove_image4!
    when 'image5'
      product.remove_image5!
    when 'image6'
      product.remove_image6!
    when 'default_image'
      product.default_image!
    else
    end
    product.save!
    render json: { status: 'ok', status_code: 200 }
  end

  private

  def find_product
    @product = Shoppe::Product.find_by_permalink(params[:id])
  end

end
