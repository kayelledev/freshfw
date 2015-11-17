class ProductCategoriesController < ApplicationController
  # include ActionView::Helpers::UrlHelper

  def index_type
    @categories = Shoppe::ProductCategory.all
  end

  def index_size
    @categories = Shoppe::ProductCategory.all
  end


def category_tree
  @nodes = ProductCategory.categories_to_tree
  render :json => @nodes.uniq.compact.to_json
end


end
