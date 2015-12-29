class ProductsController < ApplicationController
  include ProductsHelper
  include ActionView::Helpers::UrlHelper
  before_action :find_product, except: [:index, :get_product]
  load_and_authorize_resource

  def index
    @products = Product.root.includes(:product_category, :variants).order(:parent_id)
    @products = @products.group_by(&:product_category)
    @project_categories = current_user.project_categories if current_user
  end

  def show
    @items = Product.all
    @categories = ProductCategory.all
    reviewed_product = Product.find_by_permalink(params[:id])
    review = current_user.reviews.find_or_create_by(product: reviewed_product) if current_user
    review.touch if review
  end

  def buy
    current_order.order_items.add_item(@product, 1)
    redirect_to product_path(id: root_product.permalink), :notice => "Product has been added successfully! #{link_to 'View your Cart', cart_path}"
  end

  def destroy_img
    product = Product.find(params[:id])
    product.update(params[:img_id].to_sym => nil)
    product.update("url_#{params[:img_id]}".to_sym => nil)
    product.send "remove_#{params[:img_id]}!"
    product.save!
    render json: { status: 'ok', status_code: 200 }
  end

  def get_product
    @product = Product.find_by(sku: params[:sku])
    respond_to do |format|
      format.js
    end
  end

  private

  def find_product
    @product = Product.find_by_permalink(params[:id])
  end

end
