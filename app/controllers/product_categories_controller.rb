class ProductCategoriesController < ApplicationController
  include ActionView::Helpers::UrlHelper

  def index_type
    @categories = Shoppe::ProductCategory.all
  end

  def index_size
    @categories = Shoppe::ProductCategory.all
  end
end
