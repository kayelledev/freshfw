class UpdateProductPermalink < ActiveRecord::Migration
  def change
  	Product.all.each{|p| p.update(permalink: "#{p.sku}-#{p.name.parameterize}")}
  end
end
