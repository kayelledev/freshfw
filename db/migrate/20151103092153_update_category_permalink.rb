class UpdateCategoryPermalink < ActiveRecord::Migration
  def change
  	ProductCategory.all.each{|pc| pc.update(permalink: "#{pc.name.parameterize}")}
  end
end
