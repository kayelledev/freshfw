class UpdateProductPermalinkPart3 < ActiveRecord::Migration
  def change
    Shoppe::Product.all.each do |product|
      if Shoppe::Product.where(permalink: product.name.parameterize).empty?
        permalink = "#{product.name.parameterize}"
      else
        permalink = "#{product.name.parameterize}-#{product.sku.parameterize}"
      end
      product.update(permalink: permalink)
    end
  end
end
