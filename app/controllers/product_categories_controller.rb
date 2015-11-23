class ProductCategoriesController < ApplicationController
  include ActionView::Helpers::UrlHelper
  load_and_authorize_resource
 
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


end
