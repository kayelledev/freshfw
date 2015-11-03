class UpdateProductPermalinkPart2 < ActiveRecord::Migration
  def change
  	Product.all.each{|p| p.update(permalink: "#{p.name.parameterize}-#{p.sku}")}
  end
end
