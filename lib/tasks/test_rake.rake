namespace 'test_rake' do
  desc "Loading all models and their related controller methods inpermissions table."
  task(:test_rake => :environment) do
     Shoppe::Zone.create(name:"rake")    
  end
end
