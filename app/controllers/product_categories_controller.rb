class ProductCategoriesController < ApplicationController
  include ActionView::Helpers::UrlHelper
  load_and_authorize_resource
  before_action :check_product_category_access, only: [:show]
 
   def index_type
    @categories = ProductCategory.all
  end

  def index_size
    @categories = ProductCategory.all
  end


def category_tree
  @nodes = ProductCategory.categories_to_tree
  render :json => @nodes.uniq.compact.to_json
end

def show
  @project_category = ProductCategory.find(params[:id])
  @products = Product.root.includes(:product_category, :variants).order(:parent_id)
  @products = @products.group_by(&:product_category)
end

private

def check_product_category_access
  @project_category = ProductCategory.find(params[:id])
  # current_user.project_category_allowed?(@project_category)
  redirect_to root_path, notice: "Access to this category is restricted" if current_user && !current_user.project_category_allowed?(@project_category)
end


end
