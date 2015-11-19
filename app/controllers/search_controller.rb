class SearchController < ApplicationController
  load_and_authorize_resource :class => 'SearchController'

  def index
    @search_words = params['srch-term'].split(' ').sort
    if @search_words.empty?
      redirect_to :back
      return
    end
    products = Product.all
    @search_results = []
    products.each do |product|
      @search_string = [ product.name, product.description, product.short_description ].join(' ').downcase
      @search_words.each do |word|
        word.downcase!
        @search_results << product if @search_string.include?(word) || product.sku.eql?(word)
      end
      @search_string = nil
    end
    @search_results.uniq!
  end

end
