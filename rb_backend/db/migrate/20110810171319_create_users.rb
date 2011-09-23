class CreateUsers < ActiveRecord::Migration
  def self.up
    create_table :users do |t|
      t.string :name
      t.string :email
      t.string :hashed_password
      t.string :skin_preference
      t.datetime :date_joined

      t.timestamps
    end
  end

  def self.down
    drop_table :users
  end
end
